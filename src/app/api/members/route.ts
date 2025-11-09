import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/jsonDB";

// Safe JSON parse
async function safeParseJSON(request: Request) {
  try {
    const text = await request.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// GET /api/members
export async function GET() {
  try {
    const db = await readDB();
    return NextResponse.json(db.members);
  } catch (error: any) {
    console.error("Error reading members:", error);
    return NextResponse.json({ error: "Failed to read members" }, { status: 500 });
  }
}

// POST /api/members
export async function POST(request: Request) {
  const body = await safeParseJSON(request);
  if (!body || !body.name || !body.email) {
    return NextResponse.json({ error: "Missing required fields: name and email" }, { status: 400 });
  }

  const db = await readDB();
  const newMember = {
    id: db.members.length ? db.members[db.members.length - 1].id + 1 : 1,
    name: body.name,
    email: body.email,
    phone: body.phone || "",
    joinedAt: body.joinedAt || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  db.members.push(newMember);
  await writeDB(db);
  return NextResponse.json(newMember, { status: 201 });
}

// PUT /api/members
export async function PUT(request: Request) {
  const body = await safeParseJSON(request);
  if (!body || !body.id) return NextResponse.json({ error: "Missing member ID" }, { status: 400 });

  const db = await readDB();
  const index = db.members.findIndex((m: any) => m.id === body.id);
  if (index === -1) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  db.members[index] = { ...db.members[index], ...body };
  await writeDB(db);
  return NextResponse.json(db.members[index]);
}

// DELETE /api/members
export async function DELETE(request: Request) {
  const body = await safeParseJSON(request);
  if (!body || !body.id) return NextResponse.json({ error: "Missing member ID" }, { status: 400 });

  const db = await readDB();
  const newMembers = db.members.filter((m: any) => m.id !== body.id);
  if (newMembers.length === db.members.length) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  db.members = newMembers;
  await writeDB(db);
  return NextResponse.json({ message: "Member deleted successfully" });
}
