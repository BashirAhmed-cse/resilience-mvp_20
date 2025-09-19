import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { SystemState } from "@/lib/types"

// External API endpoint for third-party auditors to access NAV data
export async function GET() {
  try {
    const db = await getDatabase()
    const collection = db.collection<SystemState>("system_states")

    const latestState = await collection.findOne({}, { sort: { createdAt: -1 } })

    if (!latestState) {
      return NextResponse.json({ error: "No system state found" }, { status: 404 })
    }

    // Return sanitized data for external consumption
    const externalData = {
      nav: latestState.nav,
      timestamp: latestState.timestamp,
      status: latestState.mode === "normal" ? "operational" : "crisis_mode",
      lastUpdated: latestState.updatedAt,
      // Add metadata for external auditors
      metadata: {
        currency: "USD",
        precision: 0,
        source: "ResilienceOS+",
        version: "1.0.0",
      },
    }

    return NextResponse.json(externalData, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error in external NAV API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
