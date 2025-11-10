"use client";

import { useEffect, useState } from "react";
import { useSprings, animated } from "@react-spring/web";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type Counts = {
  sermons: number;
  members: number;
  videos: number;
  blogs: number;
  testimonies: number;
  abouts: number;
};

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts>({
    sermons: 0,
    members: 0,
    videos: 0,
    blogs: 0,
    testimonies: 0,
    abouts: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchCounts = async () => {
    setLoading(true);
    const [sermons, members, videos, blogs, testimonies, abouts] =
      await Promise.all([
        fetch("/api/sermons").then(r => r.json()),
        fetch("/api/members").then(r => r.json()),
        fetch("/api/videos").then(r => r.json()),
        fetch("/api/blog").then(r => r.json()),
        fetch("/api/testimonies").then(r => r.json()),
        fetch("/api/about").then(r => r.json()),
      ]);

    setCounts({
      sermons: sermons.length,
      members: members.length,
      videos: videos.length,
      blogs: blogs.length,
      testimonies: testimonies.length,
      abouts: abouts.length,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const data = [
    { name: "Sermons", value: counts.sermons },
    { name: "Members", value: counts.members },
    { name: "Videos", value: counts.videos },
    { name: "Blogs", value: counts.blogs },
    { name: "Testimonies", value: counts.testimonies },
    { name: "About", value: counts.abouts },
  ];

  // Animated counters using useSprings
  const springs = useSprings(
    data.length,
    data.map(d => ({ number: d.value, from: { number: 0 }, config: { duration: 800 } }))
  );

  const cardClass =
    "p-6 bg-white shadow rounded text-center flex flex-col justify-center items-center";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-700">Admin Dashboard</h1>
        <button
          onClick={fetchCounts}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Refresh Stats
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {springs.map((props, idx) => (
          <div key={data[idx].name} className={cardClass}>
            <animated.span className="text-4xl font-bold">
              {props.number.to(n => Math.floor(n))}
            </animated.span>
            <span className="mt-2 text-gray-600">{data[idx].name}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Content Overview (Bar Chart)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Content Distribution (Pie Chart)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
