import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { SystemState } from "@/lib/types"

// Comprehensive system status endpoint for external monitoring
export async function GET() {
  try {
    const db = await getDatabase()
    const collection = db.collection<SystemState>("system_states")

    const latestState = await collection.findOne({}, { sort: { createdAt: -1 } })

    if (!latestState) {
      return NextResponse.json({ error: "No system state found" }, { status: 404 })
    }

    // Calculate uptime (mock calculation)
    const uptimePercentage = latestState.mode === "normal" ? 99.9 : 95.5

    const externalData = {
      systemStatus: {
        mode: latestState.mode,
        operational: latestState.mode === "normal",
        timestamp: latestState.timestamp,
        uptime: `${uptimePercentage}%`,
      },
      financialMetrics: {
        nav: {
          value: latestState.nav,
          currency: "USD",
          lastUpdated: latestState.timestamp,
        },
        liquidity: {
          percentage: latestState.liquidity,
          status: latestState.liquidity > 25 ? "healthy" : latestState.liquidity > 15 ? "warning" : "critical",
          lastUpdated: latestState.timestamp,
        },
      },
      governance: {
        protocol: "multi-signature",
        threshold: "3-of-5",
        status: "active",
      },
      facilities: {
        primary: "active",
        backup: "standby",
        emergency: "available",
      },
      compliance: {
        status: "compliant",
        lastAudit: new Date().toISOString(),
        nextAudit: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      },
      metadata: {
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
        lastUpdated: new Date().toISOString(),
        source: "ResilienceOS+",
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
    console.error("Error in external system status API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
