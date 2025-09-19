import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { SystemState } from "@/lib/types"

export async function GET() {
  try {
    const db = await getDatabase()
    const collection = db.collection<SystemState>("system_states")

    // Get the latest system state
    const latestState = await collection.findOne({}, { sort: { createdAt: -1 } })

    if (!latestState) {
      // Return default state if none exists
      const defaultState: SystemState = {
        mode: "normal",
        nav: 1001325059,
        liquidity: 32,
        timestamp: new Date().toISOString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await collection.insertOne(defaultState)
      return NextResponse.json(defaultState)
    }

    return NextResponse.json(latestState)
  } catch (error) {
    console.error("Error fetching system state:", error)
    return NextResponse.json({ error: "Failed to fetch system state" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode, nav, liquidity } = body

    const db = await getDatabase()
    const collection = db.collection<SystemState>("system_states")

    const newState: SystemState = {
      mode,
      nav,
      liquidity,
      timestamp: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(newState)

    return NextResponse.json({
      ...newState,
      _id: result.insertedId,
    })
  } catch (error) {
    console.error("Error updating system state:", error)
    return NextResponse.json({ error: "Failed to update system state" }, { status: 500 })
  }
}
