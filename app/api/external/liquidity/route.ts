import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { SystemState } from "@/lib/types"

// External API endpoint for liquidity data
export async function GET() {
  try {
    const db = await getDatabase()
    const collection = db.collection<SystemState>("system_states")

    const latestState = await collection.findOne({}, { sort: { createdAt: -1 } })

    if (!latestState) {
      return NextResponse.json({ error: "No system state found" }, { status: 404 })
    }

    const externalData = {
      liquidityPercentage: latestState.liquidity,
      timestamp: latestState.timestamp,
      status: latestState.mode === "normal" ? "operational" : "crisis_mode",
      thresholds: {
        normal: { min: 25, max: 35 },
        warning: { min: 15, max: 25 },
        critical: { min: 0, max: 15 },
      },
      lastUpdated: latestState.updatedAt,
      metadata: {
        unit: "percentage",
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
    console.error("Error in external liquidity API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
