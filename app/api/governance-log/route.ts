import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDatabase()
    const collection = db.collection("governance_logs")

    const governanceLogs = await collection.find({}).sort({ timestampUTC: -1 }).toArray()

    return NextResponse.json(
      governanceLogs.map((log) => ({
        _id: log._id,
        timestampUTC: log.timestampUTC,
        action: log.action,
        notes: log.notes,
        multisig: log.multisig,
      })),
    )
  } catch (error) {
    console.error("Error fetching governance log:", error)
    return NextResponse.json({ error: "Failed to fetch governance log" }, { status: 500 })
  }
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function PATCH() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
