import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { SystemState, LogEntry } from "@/lib/types"

export async function POST() {
  try {
    const db = await getDatabase()
    const systemCollection = db.collection<SystemState>("system_states")
    const logsCollection = db.collection<LogEntry>("logs")

    // Get current state
    const currentState = await systemCollection.findOne({}, { sort: { createdAt: -1 } })

    if (!currentState) {
      return NextResponse.json({ error: "No current system state found" }, { status: 404 })
    }

    // Create new crisis state
    const crisisState: SystemState = {
      mode: "liquidity",
      nav: Math.floor(currentState.nav * 0.92), // 8% drop
      liquidity: 8, // Severe liquidity constraint
      timestamp: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Create log entry
    const logEntry: LogEntry = {
      id: Date.now().toString(),
      type: "crisis",
      event: "Liquidity Freeze Triggered",
      timestamp: new Date().toISOString(),
      details: "Liquidity constraints activated",
      createdAt: new Date(),
    }

    // Insert both records
    await Promise.all([systemCollection.insertOne(crisisState), logsCollection.insertOne(logEntry)])

    return NextResponse.json({
      systemState: crisisState,
      logEntry,
    })
  } catch (error) {
    console.error("Error triggering liquidity freeze:", error)
    return NextResponse.json({ error: "Failed to trigger liquidity freeze" }, { status: 500 })
  }
}
