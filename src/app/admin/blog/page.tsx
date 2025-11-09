"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { AdminTable } from "@/components/AdminTable";
import Modal from "@/components/Modal";

type BlogPost = {
  id: number;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
  createdAt: string;
};

export default function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [publishedAt, setPublishedAt] = useState<Date | null>(null);

  const fetchPosts = async () => {
    const res = await fetch("/api/blog");
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => { fetchPosts(); }, []);

  // Add new blog post
  const handleAdd = async () => {
    if (!title || !content) return alert("Title and Content required");
    const res = await fetch("/api/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        author,
        publishedAt: publishedAt ? publishedAt.toISOString() : new Date().toISOString(),
      }),
    });
    const newPost = await res.json();
    setPosts([...posts, newPost]);
    setTitle(""); setContent(""); setAuthor(""); setPublishedAt(null);
  };

  // Open modal for editing
  const openEditModal = (post: BlogPost) => {
    setEditPost(post);
    setModalOpen(true);
  };

  // Save edits
  const handleSave = async () => {
    if (!editPost) return;
    const res = await fetch("/api/blog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editPost),
    });
    const updated = await res.json();
    setPosts(posts.map(p => (p.id === updated.id ? updated : p)));
    setModalOpen(false);
    setEditPost(null);
  };

  // Delete blog post
  const handleDelete = async (post: BlogPost) => {
    await fetch("/api/blog", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: post.id }),
    });
    setPosts(posts.filter(p => p.id !== post.id));
  };

  // Truncate content for table display
  const truncate = (str: string, max = 100) => (str.length > max ? str.slice(0, max) + "..." : str);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">Manage Blog Posts</h1>

      {/* Add Form */}
      <div className="p-4 bg-white shadow rounded space-y-2">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={e => setContent(e.target.value)}
          className="border rounded px-2 py-1 w-full h-24"
        />
        <DatePicker
          selected={publishedAt}
          onChange={d => setPublishedAt(d)}
          showTimeSelect
          dateFormat="Pp"
          className="border rounded px-2 py-1 w-full"
          placeholderText="Published At"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Blog Post
        </button>
      </div>

      {/* Table */}
      <AdminTable
        columns={[
          { key: "title", label: "Title" },
          { key: "author", label: "Author" },
          { key: "content", label: "Content" },
          { key: "publishedAt", label: "Published At" },
        ]}
        data={posts.map(p => ({ ...p, content: truncate(p.content, 100) }))}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {/* Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {editPost && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Edit Blog Post</h2>
            <input
              type="text"
              value={editPost.title}
              onChange={e => setEditPost({ ...editPost, title: e.target.value })}
              className="border rounded px-2 py-1 w-full"
            />
            <input
              type="text"
              value={editPost.author}
              onChange={e => setEditPost({ ...editPost, author: e.target.value })}
              className="border rounded px-2 py-1 w-full"
            />
            <textarea
              value={editPost.content}
              onChange={e => setEditPost({ ...editPost, content: e.target.value })}
              className="border rounded px-2 py-1 w-full h-24"
            />
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
