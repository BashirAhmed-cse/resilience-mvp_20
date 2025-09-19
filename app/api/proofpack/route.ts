import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import crypto from "crypto"

export async function POST() {
  try {
    const db = await getDatabase()

    const systemState =
      (await db.collection("system_states").findOne({ _id: "singleton" })) ||
      (await db.collection("system_states").findOne({}, { sort: { updatedAtUTC: -1 } }))

    const auditLogs = await db.collection("audit_logs").find({}).sort({ timestampUTC: -1 }).toArray()
    const governanceLogs = await db.collection("governance_logs").find({}).sort({ timestampUTC: -1 }).toArray()

    if (!systemState) {
      return NextResponse.json({ error: "No system state found" }, { status: 404 })
    }

    const proofPackData = {
      nav: systemState.nav,
      liquidityPct: systemState.liquidityPct,
      systemState: systemState.state,
      auditLog: auditLogs,
      governanceLog: governanceLogs,
      generatedAtUTC: new Date().toISOString(),
    }

    // Generate SHA-256 hash
    const dataString = JSON.stringify(proofPackData, null, 2)
    const hash = crypto.createHash("sha256").update(dataString).digest("hex")

    // Generate dummy signature
    const signature = crypto
      .createHash("sha256")
      .update(`${hash}:${process.env.PROOF_PACK_SECRET || "demo-secret"}`)
      .digest("hex")

    const finalProofPack = {
      ...proofPackData,
      sha256: hash,
      signature,
    }

    const filename = `proofpack-${new Date().toISOString().replace(/[:.-]/g, "")}.json`

    return NextResponse.json(finalProofPack, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error generating proof pack:", error)
    return NextResponse.json({ error: "Failed to generate proof pack" }, { status: 500 })
  }
}
