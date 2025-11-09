import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/jsonDB";

// Utility to parse JSON safely
async function safeParseJSON(request: Request) {
  try {
    const text = await request.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// GET /api/sermons → list all sermons
export async function GET() {
  try {
    const db = await readDB();
    return NextResponse.json(db.sermons);
  } catch (error: any) {
    console.error("Error reading sermons:", error);
    return NextResponse.json({ error: "Failed to read sermons" }, { status: 500 });
  }
}

// POST /api/sermons → add new sermon
export async function POST(request: Request) {
  const body = await safeParseJSON(request);
  if (!body || !body.title || !body.speaker) {
    return NextResponse.json({ error: "Missing required fields: title and speaker" }, { status: 400 });
  }

  const db = await readDB();
  const newSermon = {
    id: db.sermons.length ? db.sermons[db.sermons.length - 1].id + 1 : 1,
    title: body.title,
    speaker: body.speaker,
    videoUrl: body.videoUrl || "",
    date: body.date || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  db.sermons.push(newSermon);
  await writeDB(db);
  return NextResponse.json(newSermon, { status: 201 });
}

// PUT /api/sermons → update sermon
export async function PUT(request: Request) {
  const body = await safeParseJSON(request);
  if (!body || !body.id) {
    return NextResponse.json({ error: "Missing sermon ID" }, { status: 400 });
  }

  const db = await readDB();
  const index = db.sermons.findIndex((s: any) => s.id === body.id);
  if (index === -1) return NextResponse.json({ error: "Sermon not found" }, { status: 404 });

  db.sermons[index] = { ...db.sermons[index], ...body };
  await writeDB(db);
  return NextResponse.json(db.sermons[index]);
}

// DELETE /api/sermons → delete sermon
export async function DELETE(request: Request) {
  const body = await safeParseJSON(request);
  if (!body || !body.id) return NextResponse.json({ error: "Missing sermon ID" }, { status: 400 });

  const db = await readDB();
  const newSermons = db.sermons.filter((s: any) => s.id !== body.id);
  if (newSermons.length === db.sermons.length) return NextResponse.json({ error: "Sermon not found" }, { status: 404 });

  db.sermons = newSermons;
  await writeDB(db);
  return NextResponse.json({ message: "Sermon deleted successfully" });
}
