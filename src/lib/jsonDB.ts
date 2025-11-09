import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "db.json");

export async function readDB() {
  try {
    const data = await fs.promises.readFile(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      const initialData = { events: [], sermons: [], members: [] };
      await fs.promises.writeFile(dbPath, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    throw error;
  }
}

export async function writeDB(data: any) {
  await fs.promises.writeFile(dbPath, JSON.stringify(data, null, 2));
}
