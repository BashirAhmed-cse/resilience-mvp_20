import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { SystemState, LogEntry } from "@/lib/types"

export async function POST() {
  try {
    const db = await getDatabase()
    const systemCollection = db.collection<SystemState>("system_states")
    const logsCollection = db.collection<LogEntry>("logs")

    // Create normal state
    const normalState: SystemState = {
      mode: "normal",
      nav: 1001325059, // Reset to baseline
      liquidity: 32,
      timestamp: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Create log entry
    const logEntry: LogEntry = {
      id: Date.now().toString(),
      type: "reset",
      event: "Reset to Normal Operations",
      timestamp: new Date().toISOString(),
      details: "All systems restored to normal",
      createdAt: new Date(),
    }

    // Insert both records
    await Promise.all([systemCollection.insertOne(normalState), logsCollection.insertOne(logEntry)])

    return NextResponse.json({
      systemState: normalState,
      logEntry,
    })
  } catch (error) {
    console.error("Error resetting to normal:", error)
    return NextResponse.json({ error: "Failed to reset to normal" }, { status: 500 })
  }
}
