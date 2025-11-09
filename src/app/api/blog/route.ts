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

// GET /api/blog
export async function GET() {
  try {
    const db = await readDB();
    return NextResponse.json(db.blog);
  } catch (error: any) {
    console.error("Error reading blog:", error);
    return NextResponse.json({ error: "Failed to read blog posts" }, { status: 500 });
  }
}

// POST /api/blog
export async function POST(request: Request) {
  const body = await safeParseJSON(request);
  if (!body || !body.title || !body.content) {
    return NextResponse.json({ error: "Missing required fields: title and content" }, { status: 400 });
  }

  const db = await readDB();
  const newPost = {
    id: db.blog.length ? db.blog[db.blog.length - 1].id + 1 : 1,
    title: body.title,
    content: body.content,
    author: body.author || "Admin",
    publishedAt: body.publishedAt || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  db.blog.push(newPost);
  await writeDB(db);
  return NextResponse.json(newPost, { status: 201 });
}

// PUT /api/blog
export async function PUT(request: Request) {
  const body = await safeParseJSON(request);
  if (!body || !body.id) return NextResponse.json({ error: "Missing blog ID" }, { status: 400 });

  const db = await readDB();
  const index = db.blog.findIndex((b: any) => b.id === body.id);
  if (index === -1) return NextResponse.json({ error: "Blog post not found" }, { status: 404 });

  db.blog[index] = { ...db.blog[index], ...body };
  await writeDB(db);
  return NextResponse.json(db.blog[index]);
}

// DELETE /api/blog
export async function DELETE(request: Request) {
  const body = await safeParseJSON(request);
  if (!body || !body.id) return NextResponse.json({ error: "Missing blog ID" }, { status: 400 });

  const db = await readDB();
  const newBlog = db.blog.filter((b: any) => b.id !== body.id);
  if (newBlog.length === db.blog.length) return NextResponse.json({ error: "Blog post not found" }, { status: 404 });

  db.blog = newBlog;
  await writeDB(db);
  return NextResponse.json({ message: "Blog post deleted successfully" });
}
