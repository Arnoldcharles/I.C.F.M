"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { AdminTable } from "@/components/AdminTable";
import Modal from "@/components/Modal";

type Testimony = {
  id: number;
  name: string;
  message: string;
  date: string;
  createdAt: string;
};

export default function TestimoniesAdmin() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTestimony, setEditTestimony] = useState<Testimony | null>(null);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState<Date | null>(null);

  const fetchTestimonies = async () => {
    const res = await fetch("/api/testimonies");
    const data = await res.json();
    setTestimonies(data);
  };

  useEffect(() => { fetchTestimonies(); }, []);

  // Add new testimony
  const handleAdd = async () => {
    if (!name || !message) return alert("Name and Message required");

    const res = await fetch("/api/testimonies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        message,
        date: date ? date.toISOString() : new Date().toISOString(),
      }),
    });

    const newTestimony = await res.json();
    setTestimonies([...testimonies, newTestimony]);
    setName(""); setMessage(""); setDate(null);
  };

  // Open modal for editing
  const openEditModal = (t: Testimony) => {
    setEditTestimony(t);
    setModalOpen(true);
  };

  // Save edits
  const handleSave = async () => {
    if (!editTestimony) return;
    const res = await fetch("/api/testimonies", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editTestimony),
    });
    const updated = await res.json();
    setTestimonies(testimonies.map(t => (t.id === updated.id ? updated : t)));
    setModalOpen(false);
    setEditTestimony(null);
  };

  // Delete testimony
  const handleDelete = async (t: Testimony) => {
    await fetch("/api/testimonies", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id }),
    });
    setTestimonies(testimonies.filter(t2 => t2.id !== t.id));
  };

  // Truncate message for table
  const truncateMessage = (msg: string, max = 100) =>
    msg.length > max ? msg.slice(0, max) + "..." : msg;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">Manage Testimonies</h1>

      {/* Add Form */}
      <div className="p-4 bg-white shadow rounded space-y-2">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="border rounded px-2 py-1 w-full h-24"
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
          Add Testimony
        </button>
      </div>

      {/* Table */}
      <AdminTable
        columns={[
          { key: "name", label: "Name" },
          { key: "message", label: "Message" },
          { key: "date", label: "Date" },
        ]}
        data={testimonies.map(t => ({ ...t, message: truncateMessage(t.message, 100) }))}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {/* Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {editTestimony && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Edit Testimony</h2>
            <input
              type="text"
              value={editTestimony.name}
              onChange={e => setEditTestimony({ ...editTestimony, name: e.target.value })}
              className="border rounded px-2 py-1 w-full"
            />
            <textarea
              value={editTestimony.message}
              onChange={e => setEditTestimony({ ...editTestimony, message: e.target.value })}
              className="border rounded px-2 py-1 w-full h-24"
            />
            <DatePicker
              selected={new Date(editTestimony.date)}
              onChange={d => setEditTestimony({ ...editTestimony, date: d?.toISOString() || editTestimony.date })}
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
