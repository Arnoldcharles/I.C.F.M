"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { AdminTable } from "@/components/AdminTable";
import Modal from "@/components/Modal";

type Sermon = {
  id: number;
  title: string;
  preacher: string;
  videoUrl: string;
  date: string;
  createdAt: string;
};

export default function SermonsAdmin() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSermon, setEditSermon] = useState<Sermon | null>(null);

  const [title, setTitle] = useState("");
  const [preacher, setPreacher] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [date, setDate] = useState<Date | null>(null);

  const fetchSermons = async () => {
    const res = await fetch("/api/sermons");
    const data = await res.json();
    setSermons(data);
  };

  useEffect(() => { fetchSermons(); }, []);

  // Add new sermon
  const handleAdd = async () => {
    if (!title || !preacher || !videoUrl) return alert("Title, Preacher and Video URL required");

    const res = await fetch("/api/sermons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        preacher,
        videoUrl,
        date: date ? date.toISOString() : new Date().toISOString(),
      }),
    });

    const newSermon = await res.json();
    setSermons([...sermons, newSermon]);
    setTitle(""); setPreacher(""); setVideoUrl(""); setDate(null);
  };

  // Open modal for editing
  const openEditModal = (s: Sermon) => {
    setEditSermon(s);
    setModalOpen(true);
  };

  // Save edits
  const handleSave = async () => {
    if (!editSermon) return;
    const res = await fetch("/api/sermons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editSermon),
    });
    const updated = await res.json();
    setSermons(sermons.map(s => (s.id === updated.id ? updated : s)));
    setModalOpen(false);
    setEditSermon(null);
  };

  // Delete sermon
  const handleDelete = async (s: Sermon) => {
    await fetch("/api/sermons", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: s.id }),
    });
    setSermons(sermons.filter(s2 => s2.id !== s.id));
  };

  // Truncate title for table
  const truncate = (str: string, max = 50) =>
    str.length > max ? str.slice(0, max) + "..." : str;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">Manage Sermons</h1>

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
          placeholder="Preacher"
          value={preacher}
          onChange={e => setPreacher(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
        <input
          type="text"
          placeholder="Video URL"
          value={videoUrl}
          onChange={e => setVideoUrl(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
        <DatePicker
          selected={date}
          onChange={d => setDate(d)}
          showTimeSelect
          dateFormat="Pp"
          className="border rounded px-2 py-1 w-full"
          placeholderText="Date"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Sermon
        </button>
      </div>

      {/* Table */}
      <AdminTable
        columns={[
          { key: "title", label: "Title" },
          { key: "preacher", label: "Preacher" },
          { key: "videoUrl", label: "Video URL" },
          { key: "date", label: "Date" },
        ]}
        data={sermons.map(s => ({ ...s, title: truncate(s.title), videoUrl: truncate(s.videoUrl, 50) }))}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {/* Edit Modal */}
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
              value={editSermon.preacher}
              onChange={e => setEditSermon({ ...editSermon, preacher: e.target.value })}
              className="border rounded px-2 py-1 w-full"
            />
            <input
              type="text"
              value={editSermon.videoUrl}
              onChange={e => setEditSermon({ ...editSermon, videoUrl: e.target.value })}
              className="border rounded px-2 py-1 w-full"
            />
            <DatePicker
              selected={new Date(editSermon.date)}
              onChange={d => setEditSermon({ ...editSermon, date: d?.toISOString() || editSermon.date })}
              showTimeSelect
              dateFormat="Pp"
              className="border rounded px-2 py-1 w-full"
              placeholderText="Date"
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
