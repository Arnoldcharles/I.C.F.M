import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/jsonDB";

async function safeParseJSON(request: Request) {
  try {
    const text = await request.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// GET /api/about
export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.about);
}

// POST /api/about
export async function POST(request: Request) {
  const body = await safeParseJSON(request);
  if (!body || !body.title || !body.content) {
    return NextResponse.json({ error: "Missing required fields: title and content" }, { status: 400 });
  }

  const db = await readDB();
  const newEntry = {
    id: db.about.length ? db.about[db.about.length - 1].id + 1 : 1,
    title: body.title,
    content: body.content,
    createdAt: new Date().toISOString(),
  };

  db.about.push(newEntry);
  await writeDB(db);
  return NextResponse.json(newEntry, { status: 201 });
}

// PUT /api/about
export async function PUT(request: Request) {
  const body = await safeParseJSON(request);
  if (!body || !body.id) return NextResponse.json({ error: "Missing About ID" }, { status: 400 });

  const db = await readDB();
  const index = db.about.findIndex((a: any) => a.id === body.id);
  if (index === -1) return NextResponse.json({ error: "About entry not found" }, { status: 404 });

  db.about[index] = { ...db.about[index], ...body };
  await writeDB(db);
  return NextResponse.json(db.about[index]);
}

// DELETE /api/about
export async function DELETE(request: Request) {
  const body = await safeParseJSON(request);
  if (!body || !body.id) return NextResponse.json({ error: "Missing About ID" }, { status: 400 });

  const db = await readDB();
  const newAbout = db.about.filter((a: any) => a.id !== body.id);
  if (newAbout.length === db.about.length) return NextResponse.json({ error: "About entry not found" }, { status: 404 });

  db.about = newAbout;
  await writeDB(db);
  return NextResponse.json({ message: "About entry deleted successfully" });
}
