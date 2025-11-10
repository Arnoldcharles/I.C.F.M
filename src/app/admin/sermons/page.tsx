"use client";

import { useEffect, useState } from "react";
import { AdminTable } from "@/components/AdminTable";
import Modal from "@/components/Modal";
import React from "react";

type Sermon = {
  id: number;
  title: string;
  speaker: string;
  videoUrl?: string;
  date: string;
};

export default function SermonsAdmin() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSermon, setEditSermon] = useState<Sermon | null>(null);

  const [newSermon, setNewSermon] = useState({
    title: "",
    speaker: "",
    videoUrl: "",
    date: "",
  });

  // Fetch sermons from JSON storage
  const fetchSermons = async () => {
    try {
      const res = await fetch("/api/sermons");
      const data = await res.json();
      if (Array.isArray(data)) setSermons(data);
      else setSermons([]);
    } catch (err) {
      console.error("Error fetching sermons:", err);
      setSermons([]);
    }
  };

  useEffect(() => {
    fetchSermons();
  }, []);

  // Safe truncate
  const truncate = (str?: string | null, max = 50) =>
    str ? (str.length > max ? str.slice(0, max) + "..." : str) : "";

  // Handle adding new sermon
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSermon.title || !newSermon.speaker || !newSermon.date) return;

    try {
      const res = await fetch("/api/sermons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSermon),
      });

      const added = await res.json();
      setSermons([...sermons, added]);
      setNewSermon({ title: "", speaker: "", videoUrl: "", date: "" });
    } catch (err) {
      console.error("Error adding sermon:", err);
    }
  };

  // Edit and delete
  const openEditModal = (s: Sermon) => {
    setEditSermon(s);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editSermon) return;
    try {
      const res = await fetch("/api/sermons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editSermon),
      });

      const updated = await res.json();
      setSermons(sermons.map(s => (s.id === updated.id ? updated : s)));
      setModalOpen(false);
      setEditSermon(null);
    } catch (err) {
      console.error("Error saving sermon:", err);
    }
  };

  const handleDelete = async (s: Sermon) => {
    try {
      await fetch("/api/sermons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.id }),
      });
      setSermons(sermons.filter(s2 => s2.id !== s.id));
    } catch (err) {
      console.error("Error deleting sermon:", err);
    }
  };

  // Table columns
  const columns = [
    { key: "title", label: "Title" },
    { key: "speaker", label: "Speaker" },
    { key: "videoUrl", label: "Video URL", render: (v?: string) => <span>{truncate(v, 50)}</span> },
    { key: "date", label: "Date" },
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-blue-700">Manage Sermons</h1>

      {/* ➕ Add New Sermon Form */}
      <form
        onSubmit={handleAdd}
        className="p-4 border rounded-lg shadow-md bg-white grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label className="block font-semibold mb-1">Title</label>
          <input
            type="text"
            value={newSermon.title}
            onChange={e => setNewSermon({ ...newSermon, title: e.target.value })}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Speaker</label>
          <input
            type="text"
            value={newSermon.speaker}
            onChange={e => setNewSermon({ ...newSermon, speaker: e.target.value })}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Video URL</label>
          <input
            type="url"
            value={newSermon.videoUrl}
            onChange={e => setNewSermon({ ...newSermon, videoUrl: e.target.value })}
            className="border rounded px-2 py-1 w-full"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Date</label>
          <input
            type="datetime-local"
            value={newSermon.date}
            onChange={e => setNewSermon({ ...newSermon, date: e.target.value })}
            className="border rounded px-2 py-1 w-full"
            required
          />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Sermon
          </button>
        </div>
      </form>

      {/* 📋 Sermons Table */}
      <AdminTable columns={columns} data={sermons} onEdit={openEditModal} onDelete={handleDelete} />

      {/* ✏️ Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {editSermon && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Edit Sermon</h2>
            <input
              type="text"
              value={editSermon.title}
              onChange={e => setEditSermon({ ...editSermon, title: e.target.value })}
              className="border rounded px-2 py-1 w-full"
            />
            <input
              type="text"
              value={editSermon.speaker}
              onChange={e => setEditSermon({ ...editSermon, speaker: e.target.value })}
              className="border rounded px-2 py-1 w-full"
            />
            <input
              type="text"
              value={editSermon.videoUrl || ""}
              onChange={e => setEditSermon({ ...editSermon, videoUrl: e.target.value })}
              className="border rounded px-2 py-1 w-full"
            />
            <input
              type="datetime-local"
              value={editSermon.date.slice(0, 16)}
              onChange={e => setEditSermon({ ...editSermon, date: e.target.value })}
              className="border rounded px-2 py-1 w-full"
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
