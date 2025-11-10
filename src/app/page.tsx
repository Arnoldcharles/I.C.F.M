"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Sermon = { id: number; title: string; speaker: string; videoUrl: string; date: string };
type Event = { id: number; title: string; date: string; location: string };
type Blog = { id: number; title: string; content: string; date: string };
type Testimony = { id: number; name: string; content: string; date: string };

export default function HomePage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);

  // ✅ Helper to safely slice strings
  const safeSlice = (str?: string, max = 150) =>
    str ? (str.length > max ? str.slice(0, max) + "..." : str) : "No content available";

  // ✅ Fetch data
  const fetchSermons = async () => {
    try {
      const res = await fetch("/api/sermons");
      const data = await res.json();
      if (Array.isArray(data)) setSermons(data.slice(-4).reverse());
    } catch {}
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (Array.isArray(data)) setEvents(data.slice(-3).reverse());
    } catch {}
  };

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blog");
      const data = await res.json();
      if (Array.isArray(data)) setBlogs(data.slice(-3).reverse());
    } catch {}
  };

  const fetchTestimonies = async () => {
    try {
      const res = await fetch("/api/testimonies");
      const data = await res.json();
      if (Array.isArray(data)) setTestimonies(data.slice(-2).reverse());
    } catch {}
  };

  // ✅ Load all + live update
  useEffect(() => {
    fetchSermons();
    fetchEvents();
    fetchBlogs();
    fetchTestimonies();
    const interval = setInterval(() => {
      fetchSermons();
      fetchEvents();
      fetchBlogs();
      fetchTestimonies();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* 🕊️ Hero Section */}
      <header className="bg-blue-700 text-white py-20 text-center">
        <h1 className="text-4xl font-bold">International Christian Faith Mission (I.C.F.M)</h1>
        <p className="mt-3 text-lg">Building a family of faith, hope, and love</p>
        <Link href="/sermons">
          <button className="mt-6 px-6 py-2 bg-green-600 rounded hover:bg-green-700">
            Watch Sermons
          </button>
        </Link>
      </header>

      {/* 🎥 Latest Sermons */}
      <section className="p-8 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Latest Sermons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sermons.map((s) => (
            <div
              key={s.id}
              className="p-4 border rounded shadow hover:shadow-lg transition flex flex-col justify-between bg-white"
            >
              <div>
                <h3 className="font-bold text-lg">{safeSlice(s.title, 50)}</h3>
                <p className="text-sm text-gray-600">Speaker: {s.speaker || "Unknown"}</p>
                <p className="text-sm text-gray-500">
                  {s.date ? new Date(s.date).toLocaleDateString() : "No date"}
                </p>
              </div>
              {s.videoUrl ? (
                <Link href={s.videoUrl} target="_blank">
                  <button className="mt-4 px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800">
                    Watch Video
                  </button>
                </Link>
              ) : (
                <button className="mt-4 px-3 py-1 bg-gray-400 text-white rounded cursor-not-allowed">
                  No Video
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 📅 Upcoming Events */}
      <section className="bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div key={ev.id} className="p-4 bg-white rounded shadow hover:shadow-md">
                <h3 className="font-semibold text-lg">{safeSlice(ev.title, 60)}</h3>
                <p className="text-gray-500">
                  {ev.date ? new Date(ev.date).toLocaleDateString() : "No date"}
                </p>
                <p className="text-sm text-gray-700">{ev.location || "No location specified"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 📖 Latest Blog */}
      <section className="p-8 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">From Our Blog</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((b) => (
            <div key={b.id} className="p-4 border rounded bg-white shadow hover:shadow-md">
              <h3 className="font-bold text-lg mb-2">{safeSlice(b.title, 60)}</h3>
              <p className="text-gray-600 text-sm mb-2">{safeSlice(b.content, 100)}</p>
              <p className="text-gray-500 text-xs">
                {b.date ? new Date(b.date).toLocaleDateString() : "No date"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 🙌 Testimonies */}
      <section className="bg-gray-100 py-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6 text-blue-700">Testimonies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonies.map((t) => (
              <div key={t.id} className="bg-white p-6 rounded shadow text-left">
                <p className="italic text-gray-700">"{safeSlice(t.content)}"</p>
                <p className="mt-3 font-semibold text-blue-700">— {t.name || "Anonymous"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ✝️ About Section */}
      <section className="p-8 bg-white max-w-5xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">About I.C.F.M</h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-4">
          International Christian Faith Mission (I.C.F.M) is a Christ-centered community devoted to
          spreading the gospel, nurturing believers, and transforming lives through faith in Jesus
          Christ.
        </p>
        <Link href="/about">
          <button className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">
            Learn More
          </button>
        </Link>
      </section>

      {/* 📍 Contact Info */}
      <section className="bg-blue-50 py-10 text-center">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">Join Us This Sunday</h2>
        <p className="text-gray-700 mb-1">Sunday Worship – 10:00 AM</p>
        <p className="text-gray-700 mb-1">Wednesday Bible Study – 7:00 PM</p>
        <p className="text-gray-700 mb-4">1234 Faith Avenue, Grace City</p>
        <p className="text-gray-600">Phone: (123) 456-7890 | Email: info@icfm.org</p>
      </section>

      {/* 🦶 Footer */}
      <footer className="bg-blue-700 text-white py-6 text-center mt-auto">
        &copy; {new Date().getFullYear()} International Christian Faith Mission (I.C.F.M)
      </footer>
    </div>
  );
}
