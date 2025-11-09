"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { AdminTable } from "@/components/AdminTable";

type Video = {
  id: number;
  title: string;
  url: string;
  description: string;
  uploadedAt: string;
  createdAt: string;
};

export default function VideosAdmin() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedAt, setUploadedAt] = useState<Date | null>(null);

  const fetchVideos = async () => {
    const res = await fetch("/api/videos");
    const data = await res.json();
    setVideos(data);
  };

  useEffect(() => { fetchVideos(); }, []);

  // Add new video
  const handleAdd = async () => {
    if (!title || !url) return alert("Title and URL required");

    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        url,
        description,
        uploadedAt: uploadedAt ? uploadedAt.toISOString() : new Date().toISOString(),
      }),
    });
    const newVideo = await res.json();
    setVideos([...videos, newVideo]);
    setTitle(""); setUrl(""); setDescription(""); setUploadedAt(null);
  };

  // Edit video
  const handleEdit = async (video: Video) => {
    const newTitle = prompt("New Title", video.title) || video.title;
    const newUrl = prompt("New URL", video.url) || video.url;
    const newDescription = prompt("New Description", video.description) || video.description;

    const res = await fetch("/api/videos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...video,
        title: newTitle,
        url: newUrl,
        description: newDescription,
      }),
    });
    const updated = await res.json();
    setVideos(videos.map(v => (v.id === updated.id ? updated : v)));
  };

  // Delete video
  const handleDelete = async (video: Video) => {
    await fetch("/api/videos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: video.id }),
    });
    setVideos(videos.filter(v => v.id !== video.id));
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">Manage Videos</h1>

      {/* Add Video Form */}
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
          placeholder="Video URL"
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
        <DatePicker
          selected={uploadedAt}
          onChange={d => setUploadedAt(d)}
          showTimeSelect
          dateFormat="Pp"
          className="border rounded px-2 py-1 w-full"
          placeholderText="Uploaded At"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Video
        </button>
      </div>

      {/* Videos Table */}
      <AdminTable
        columns={[
          { key: "title", label: "Title" },
          { key: "url", label: "Video URL" },
          { key: "description", label: "Description" },
          { key: "uploadedAt", label: "Uploaded At" },
        ]}
        data={videos}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
