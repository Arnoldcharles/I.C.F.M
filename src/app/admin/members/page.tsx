"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { AdminTable } from "@/components/AdminTable";

type Member = {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinedAt: string;
  createdAt: string;
};

export default function MembersAdmin() {
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [joinedAt, setJoinedAt] = useState<Date | null>(null);

  const fetchMembers = async () => {
    const res = await fetch("/api/members");
    const data = await res.json();
    setMembers(data);
  };

  useEffect(() => { fetchMembers(); }, []);

  // Add new member
  const handleAdd = async () => {
    if (!name || !email) return alert("Name and Email required");

    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        joinedAt: joinedAt ? joinedAt.toISOString() : new Date().toISOString(),
      }),
    });
    const newMember = await res.json();
    setMembers([...members, newMember]);
    setName(""); setEmail(""); setPhone(""); setJoinedAt(null);
  };

  // Edit member
  const handleEdit = async (member: Member) => {
    const newName = prompt("New Name", member.name) || member.name;
    const newEmail = prompt("New Email", member.email) || member.email;
    const newPhone = prompt("New Phone", member.phone) || member.phone;

    const res = await fetch("/api/members", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...member,
        name: newName,
        email: newEmail,
        phone: newPhone,
      }),
    });
    const updated = await res.json();
    setMembers(members.map(m => (m.id === updated.id ? updated : m)));
  };

  // Delete member
  const handleDelete = async (member: Member) => {
    await fetch("/api/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: member.id }),
    });
    setMembers(members.filter(m => m.id !== member.id));
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">Manage Members</h1>

      {/* Add Member Form */}
      <div className="p-4 bg-white shadow rounded space-y-2">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
        <DatePicker
          selected={joinedAt}
          onChange={d => setJoinedAt(d)}
          showTimeSelect
          dateFormat="Pp"
          className="border rounded px-2 py-1 w-full"
          placeholderText="Joined At"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Member
        </button>
      </div>

      {/* Members Table */}
      <AdminTable
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "joinedAt", label: "Joined At" },
        ]}
        data={members}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
