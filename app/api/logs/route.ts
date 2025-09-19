import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { LogEntry } from "@/lib/types"

export async function GET() {
  try {
    const db = await getDatabase()
    const collection = db.collection<LogEntry>("logs")

    const logs = await collection.find({}).sort({ createdAt: -1 }).limit(50).toArray()

    return NextResponse.json(logs)
  } catch (error) {
    console.error("Error fetching logs:", error)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, event, details } = body

    const db = await getDatabase()
    const collection = db.collection<LogEntry>("logs")

    const newLog: LogEntry = {
      id: Date.now().toString(),
      type,
      event,
      timestamp: new Date().toISOString(),
      details,
      createdAt: new Date(),
    }

    const result = await collection.insertOne(newLog)

    return NextResponse.json({
      ...newLog,
      _id: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating log entry:", error)
    return NextResponse.json({ error: "Failed to create log entry" }, { status: 500 })
  }
}
