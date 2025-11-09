"use client";

import { useEffect, useState } from "react";

type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  // Fetch all events
  const fetchEvents = async () => {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Add new event
  const handleAdd = async () => {
    if (!title || !date) return alert("Title and Date are required");

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, date }),
    });
    const data = await res.json();
    setEvents([...events, data]);
    setTitle("");
    setDescription("");
    setDate("");
  };

  // Update event
  const handleUpdate = async (id: number) => {
    const newTitle = prompt("New title") || "";
    const newDescription = prompt("New description") || "";
    if (!newTitle) return;

    const res = await fetch("/api/events", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title: newTitle, description: newDescription }),
    });
    const updated = await res.json();
    setEvents(events.map(e => (e.id === id ? updated : e)));
  };

  // Delete event
  const handleDelete = async (id: number) => {
    const res = await fetch("/api/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    setEvents(events.filter(e => e.id !== id));
  };

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Admin Dashboard - I.C.F.M</h1>

      {/* Add Event Form */}
      <div className="mb-6 space-y-2 p-4 bg-white shadow rounded">
        <h2 className="text-xl font-semibold mb-2">Add New Event</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
        <input
          type="datetime-local"
          placeholder="Date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700"
        >
          Add Event
        </button>
      </div>

      {/* Event List */}
      <div className="space-y-4">
        {events.map(event => (
          <div
            key={event.id}
            className="p-4 bg-white shadow rounded flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold">{event.title}</h3>
              <p className="text-gray-600">{event.description}</p>
              <p className="text-sm text-gray-400">
                {new Date(event.date).toLocaleString()}
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleUpdate(event.id)}
                className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(event.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
