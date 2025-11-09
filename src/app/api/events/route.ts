import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/jsonDB";

// --- Utility to safely parse JSON from a Request ---
async function safeParseJSON(request: Request) {
  try {
    const text = await request.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// --- GET: List all events ---
export async function GET() {
  try {
    const db = await readDB();
    return NextResponse.json(db.events);
  } catch (error: any) {
    console.error("Error reading DB:", error);
    return NextResponse.json({ error: "Failed to read database" }, { status: 500 });
  }
}

// --- POST: Create a new event ---
export async function POST(request: Request) {
  try {
    const body = await safeParseJSON(request);
    if (!body) {
      return NextResponse.json({ error: "Invalid or empty JSON body" }, { status: 400 });
    }

    const { title, description = "", date } = body;
    if (!title || !date) {
      return NextResponse.json({ error: "Missing required fields: title and date" }, { status: 400 });
    }

    const db = await readDB();
    const newEvent = {
      id: db.events.length ? db.events[db.events.length - 1].id + 1 : 1,
      title,
      description,
      date,
      createdAt: new Date().toISOString(),
    };

    db.events.push(newEvent);
    await writeDB(db);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

// --- PUT: Update an existing event ---
export async function PUT(request: Request) {
  try {
    const body = await safeParseJSON(request);
    if (!body || !body.id) {
      return NextResponse.json({ error: "Missing event ID or invalid JSON" }, { status: 400 });
    }

    const db = await readDB();
    const eventIndex = db.events.findIndex((e: any) => e.id === body.id);

    if (eventIndex === -1) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    db.events[eventIndex] = { ...db.events[eventIndex], ...body };
    await writeDB(db);

    return NextResponse.json(db.events[eventIndex]);
  } catch (error: any) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// --- DELETE: Remove an event by ID ---
export async function DELETE(request: Request) {
  try {
    const body = await safeParseJSON(request);
    if (!body || !body.id) {
      return NextResponse.json({ error: "Missing event ID or invalid JSON" }, { status: 400 });
    }

    const db = await readDB();
    const updatedEvents = db.events.filter((e: any) => e.id !== body.id);

    if (updatedEvents.length === db.events.length) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    db.events = updatedEvents;
    await writeDB(db);

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
