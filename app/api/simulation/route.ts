import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { SystemState } from "@/lib/types"

// Simulation parameters
const NORMAL_NAV_DRIFT = 0.0001 // 0.01% drift per update
const NORMAL_LIQUIDITY_DRIFT = 0.002 // 0.2% drift per update
const UPDATE_INTERVAL = 5000 // 5 seconds

export async function GET() {
  try {
    const db = await getDatabase()
    const collection = db.collection<SystemState>("system_states")

    // Get the latest system state
    const latestState = await collection.findOne({}, { sort: { createdAt: -1 } })

    if (!latestState || latestState.mode !== "normal") {
      return NextResponse.json({
        message: "No simulation needed - system not in normal mode",
      })
    }

    // Calculate drift for normal operations
    const navDrift = (Math.random() - 0.5) * NORMAL_NAV_DRIFT
    const liquidityDrift = (Math.random() - 0.5) * NORMAL_LIQUIDITY_DRIFT

    const newNav = Math.max(
      latestState.nav * (1 + navDrift),
      latestState.nav * 0.95, // Don't drift below 5% of original
    )

    const newLiquidity = Math.max(
      Math.min(
        latestState.liquidity * (1 + liquidityDrift),
        35, // Max liquidity in normal mode
      ),
      25, // Min liquidity in normal mode
    )

    // Only update if there's meaningful change
    const navChange = Math.abs(newNav - latestState.nav) / latestState.nav
    const liquidityChange = Math.abs(newLiquidity - latestState.liquidity) / latestState.liquidity

    if (navChange > 0.00001 || liquidityChange > 0.001) {
      const updatedState: SystemState = {
        mode: "normal",
        nav: Math.floor(newNav),
        liquidity: Math.round(newLiquidity * 10) / 10, // Round to 1 decimal
        timestamp: new Date().toISOString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await collection.insertOne(updatedState)
      return NextResponse.json(updatedState)
    }

    return NextResponse.json({ message: "No significant change" })
  } catch (error) {
    console.error("Error in simulation:", error)
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 })
  }
}
