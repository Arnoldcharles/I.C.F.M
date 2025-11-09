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

// GET /api/videos
export async function GET() {
  try {
    const db = await readDB();
    return NextResponse.json(db.videos);
  } catch (error: any) {
    console.error("Error reading videos:", error);
    return NextResponse.json({ error: "Failed to read videos" }, { status: 500 });
  }
}

// POST /api/videos
export async function POST(request: Request) {
  const body = await safeParseJSON(request);
  if (!body || !body.title || !body.url) {
    return NextResponse.json({ error: "Missing required fields: title and url" }, { status: 400 });
  }

  const db = await readDB();
  const newVideo = {
    id: db.videos.length ? db.videos[db.videos.length - 1].id + 1 : 1,
    title: body.title,
    url: body.url,
    description: body.description || "",
    uploadedAt: body.uploadedAt || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  db.videos.push(newVideo);
  await writeDB(db);
  return NextResponse.json(newVideo, { status: 201 });
}

// PUT /api/videos
export async function PUT(request: Request) {
  const body = await safeParseJSON(request);
  if (!body || !body.id) return NextResponse.json({ error: "Missing video ID" }, { status: 400 });

  const db = await readDB();
  const index = db.videos.findIndex((v: any) => v.id === body.id);
  if (index === -1) return NextResponse.json({ error: "Video not found" }, { status: 404 });

  db.videos[index] = { ...db.videos[index], ...body };
  await writeDB(db);
  return NextResponse.json(db.videos[index]);
}

// DELETE /api/videos
export async function DELETE(request: Request) {
  const body = await safeParseJSON(request);
  if (!body || !body.id) return NextResponse.json({ error: "Missing video ID" }, { status: 400 });

  const db = await readDB();
  const newVideos = db.videos.filter((v: any) => v.id !== body.id);
  if (newVideos.length === db.videos.length) return NextResponse.json({ error: "Video not found" }, { status: 404 });

  db.videos = newVideos;
  await writeDB(db);
  return NextResponse.json({ message: "Video deleted successfully" });
}
