import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function POST() {
  try {
    const db = await getDatabase()
    const systemCollection = db.collection("system_states")
    const auditCollection = db.collection("audit_logs")
    const governanceCollection = db.collection("governance_logs")

    const currentState =
      (await systemCollection.findOne({ _id: "singleton" })) ||
      (await systemCollection.findOne({}, { sort: { updatedAtUTC: -1 } }))

    if (!currentState) {
      return NextResponse.json({ error: "No current system state found" }, { status: 404 })
    }

    const timestampUTC = new Date().toISOString()
    const prevState = currentState.state
    const nextState = "cyber"

    const newNav = Math.floor(currentState.nav * 0.975) // -2.5%
    const newLiquidityPct = 28

    // Update system state
    await systemCollection.replaceOne(
      { _id: "singleton" },
      {
        _id: "singleton",
        state: nextState,
        nav: newNav,
        liquidityPct: newLiquidityPct,
        updatedAtUTC: timestampUTC,
      },
      { upsert: true },
    )

    // Create audit log entry
    await auditCollection.insertOne({
      timestampUTC,
      actor: "admin",
      action: "trigger_cyber",
      prevState,
      nextState,
      nav: newNav,
      liquidityPct: newLiquidityPct,
    })

    // Create governance log entry
    await governanceCollection.insertOne({
      timestampUTC,
      action: "approve",
      notes: "Cyber event triggered - emergency protocols activated",
      multisig: { required: 3, approvals: 3 },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error triggering cyber event:", error)
    return NextResponse.json({ error: "Failed to trigger cyber event" }, { status: 500 })
  }
}
