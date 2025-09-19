import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDatabase()
    const collection = db.collection("system_states")

    const latestState =
      (await collection.findOne({ _id: "singleton" })) || (await collection.findOne({}, { sort: { updatedAtUTC: -1 } }))

    if (!latestState) {
      return NextResponse.json({ error: "No system state found" }, { status: 404 })
    }

    return NextResponse.json({
      state: latestState.state,
    })
  } catch (error) {
    console.error("Error fetching system state:", error)
    return NextResponse.json({ error: "Failed to fetch system state" }, { status: 500 })
  }
}
