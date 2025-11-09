"use client";

import { useEffect, useState } from "react";
import { AdminTable } from "@/components/AdminTable";
import Modal from "@/components/Modal";

type AboutEntry = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
};

export default function AboutAdmin() {
  const [aboutEntries, setAboutEntries] = useState<AboutEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<AboutEntry | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const fetchAbout = async () => {
    const res = await fetch("/api/about");
    const data = await res.json();
    setAboutEntries(data);
  };

  useEffect(() => { fetchAbout(); }, []);

  // Add new About entry
  const handleAdd = async () => {
    if (!title || !content) return alert("Title and Content required");
    const res = await fetch("/api/about", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    const newEntry = await res.json();
    setAboutEntries([...aboutEntries, newEntry]);
    setTitle(""); setContent("");
  };

  // Open modal for editing
  const openEditModal = (entry: AboutEntry) => {
    setEditEntry(entry);
    setModalOpen(true);
  };

  // Save edits
  const handleSave = async () => {
    if (!editEntry) return;
    const res = await fetch("/api/about", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editEntry),
    });
    const updated = await res.json();
    setAboutEntries(aboutEntries.map(a => (a.id === updated.id ? updated : a)));
    setModalOpen(false);
    setEditEntry(null);
  };

  // Delete entry
  const handleDelete = async (entry: AboutEntry) => {
    await fetch("/api/about", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: entry.id }),
    });
    setAboutEntries(aboutEntries.filter(a => a.id !== entry.id));
  };

  // Truncate content for table
  const truncateContent = (c: string, max = 100) =>
    c.length > max ? c.slice(0, max) + "..." : c;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">Manage About Page</h1>

      {/* Add Form */}
      <div className="p-4 bg-white shadow rounded space-y-2">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={e => setContent(e.target.value)}
          className="border rounded px-2 py-1 w-full h-24"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add About Entry
        </button>
      </div>

      {/* Table */}
      <AdminTable
        columns={[
          { key: "title", label: "Title" },
          { key: "content", label: "Content" },
          { key: "createdAt", label: "Created At" },
        ]}
        data={aboutEntries.map(a => ({ ...a, content: truncateContent(a.content, 100) }))}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {/* Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {editEntry && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Edit About Entry</h2>
            <input
              type="text"
              value={editEntry.title}
              onChange={e => setEditEntry({ ...editEntry, title: e.target.value })}
              className="border rounded px-2 py-1 w-full"
            />
            <textarea
              value={editEntry.content}
              onChange={e => setEditEntry({ ...editEntry, content: e.target.value })}
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
