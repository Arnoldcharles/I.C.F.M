"use client";

import { useEffect, useState } from "react";
import { AdminTable } from "@/components/AdminTable";
import Modal from "@/components/Modal";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [joinedAt, setJoinedAt] = useState("");

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
      body: JSON.stringify({ name, email, phone, joinedAt: joinedAt || new Date().toISOString() }),
    });

    const newMember = await res.json();
    setMembers([...members, newMember]);
    setName(""); setEmail(""); setPhone(""); setJoinedAt("");
  };

  // Open modal for editing
  const openEditModal = (m: Member) => {
    setEditMember(m);
    setModalOpen(true);
  };

  // Save edits
  const handleSave = async () => {
    if (!editMember) return;
    const res = await fetch("/api/members", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editMember),
    });
    const updated = await res.json();
    setMembers(members.map(m => (m.id === updated.id ? updated : m)));
    setModalOpen(false);
    setEditMember(null);
  };

  // Delete member
  const handleDelete = async (m: Member) => {
    await fetch("/api/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: m.id }),
    });
    setMembers(members.filter(m2 => m2.id !== m.id));
  };

  // Truncate long text for table
  const truncate = (str: string, max = 50) =>
    str.length > max ? str.slice(0, max) + "..." : str;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">Manage Members</h1>

      {/* Add Form */}
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
        <input
          type="datetime-local"
          placeholder="Joined At"
          value={joinedAt}
          onChange={e => setJoinedAt(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Member
        </button>
      </div>

      {/* Table */}
      <AdminTable
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "joinedAt", label: "Joined At" },
        ]}
        data={members.map(m => ({
          ...m,
          name: truncate(m.name),
          email: truncate(m.email),
          phone: truncate(m.phone),
        }))}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {/* Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {editMember && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Edit Member</h2>
            <input
              type="text"
              value={editMember.name}
              onChange={e => setEditMember({ ...editMember, name: e.target.value })}
              className="border rounded px-2 py-1 w-full"
            />
            <input
              type="email"
              value={editMember.email}
              onChange={e => setEditMember({ ...editMember, email: e.target.value })}
              className="border rounded px-2 py-1 w-full"
            />
            <input
              type="text"
              value={editMember.phone}
              onChange={e => setEditMember({ ...editMember, phone: e.target.value })}
              className="border rounded px-2 py-1 w-full"
            />
            <input
              type="datetime-local"
              value={editMember.joinedAt.slice(0, 16)}
              onChange={e => setEditMember({ ...editMember, joinedAt: e.target.value })}
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
