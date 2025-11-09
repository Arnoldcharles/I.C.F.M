"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { AdminTable } from "@/components/AdminTable";

type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
  createdAt: string;
};

export default function EventsAdmin() {
  const [events, setEvents] = useState<Event[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | null>(null);

  const fetchEvents = async () => {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAdd = async () => {
    if (!title || !date) return alert("Title and date required");
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        date: date.toISOString(),
      }),
    });
    const newEvent = await res.json();
    setEvents([...events, newEvent]);
    setTitle(""); setDescription(""); setDate(null);
  };

  const handleEdit = async (event: Event) => {
    const newTitle = prompt("New title", event.title) || event.title;
    const newDescription = prompt("New description", event.description) || event.description;
    const res = await fetch("/api/events", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...event, title: newTitle, description: newDescription }),
    });
    const updated = await res.json();
    setEvents(events.map(e => (e.id === updated.id ? updated : e)));
  };

  const handleDelete = async (event: Event) => {
    await fetch("/api/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: event.id }),
    });
    setEvents(events.filter(e => e.id !== event.id));
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">Manage Events</h1>

      <div className="p-4 bg-white shadow rounded space-y-2">
        <input
          type="text"
          placeholder="Title"
          className="border rounded px-2 py-1 w-full"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          className="border rounded px-2 py-1 w-full"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <DatePicker
          selected={date}
          onChange={(d) => setDate(d)}
          showTimeSelect
          dateFormat="Pp"
          className="border rounded px-2 py-1 w-full"
          placeholderText="Select date & time"
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Event
        </button>
      </div>

      <AdminTable
        columns={[
          { key: "title", label: "Title" },
          { key: "description", label: "Description" },
          { key: "date", label: "Date" },
        ]}
        data={events}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
