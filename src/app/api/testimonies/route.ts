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

// GET /api/testimonies
export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.testimonies);
}

// POST /api/testimonies
export async function POST(request: Request) {
  const body = await safeParseJSON(request);
  if (!body || !body.name || !body.message) {
    return NextResponse.json({ error: "Missing required fields: name and message" }, { status: 400 });
  }

  const db = await readDB();
  const newTestimony = {
    id: db.testimonies.length ? db.testimonies[db.testimonies.length - 1].id + 1 : 1,
    name: body.name,
    message: body.message,
    date: body.date || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  db.testimonies.push(newTestimony);
  await writeDB(db);
  return NextResponse.json(newTestimony, { status: 201 });
}

// PUT /api/testimonies
export async function PUT(request: Request) {
  const body = await safeParseJSON(request);
  if (!body || !body.id) return NextResponse.json({ error: "Missing testimony ID" }, { status: 400 });

  const db = await readDB();
  const index = db.testimonies.findIndex((t: any) => t.id === body.id);
  if (index === -1) return NextResponse.json({ error: "Testimony not found" }, { status: 404 });

  db.testimonies[index] = { ...db.testimonies[index], ...body };
  await writeDB(db);
  return NextResponse.json(db.testimonies[index]);
}

// DELETE /api/testimonies
export async function DELETE(request: Request) {
  const body = await safeParseJSON(request);
  if (!body || !body.id) return NextResponse.json({ error: "Missing testimony ID" }, { status: 400 });

  const db = await readDB();
  const newTestimonies = db.testimonies.filter((t: any) => t.id !== body.id);
  if (newTestimonies.length === db.testimonies.length) return NextResponse.json({ error: "Testimony not found" }, { status: 404 });

  db.testimonies = newTestimonies;
  await writeDB(db);
  return NextResponse.json({ message: "Testimony deleted successfully" });
}
