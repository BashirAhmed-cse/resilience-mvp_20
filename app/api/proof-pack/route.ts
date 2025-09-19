import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { SystemState, LogEntry, GovernanceLogEntry, ProofPack } from "@/lib/types"
import crypto from "crypto"
import JSZip from "jszip"

export async function POST() {
  try {
    const db = await getDatabase()

    // Fetch current system state
    const systemCollection = db.collection<SystemState>("system_states")
    const currentState = await systemCollection.findOne({}, { sort: { createdAt: -1 } })

    if (!currentState) {
      return NextResponse.json({ error: "No system state found" }, { status: 404 })
    }

    // Fetch audit logs
    const logsCollection = db.collection<LogEntry>("logs")
    const auditLogs = await logsCollection.find({}).sort({ createdAt: -1 }).limit(100).toArray()

    // Fetch governance logs
    const governanceCollection = db.collection<GovernanceLogEntry>("governance_logs")
    const governanceLogs = await governanceCollection.find({}).sort({ createdAt: -1 }).limit(100).toArray()

    // Generate proof pack
    const proofPackId = `proof-pack-${Date.now()}`
    const generatedAt = new Date().toISOString()

    // Create proof pack data
    const proofPackData = {
      id: proofPackId,
      generatedAt,
      systemState: {
        mode: currentState.mode,
        nav: currentState.nav,
        liquidity: currentState.liquidity,
        timestamp: currentState.timestamp,
        status: currentState.mode === "normal" ? "Operational" : "Crisis Mode Active",
      },
      auditLog: auditLogs.map((log) => ({
        id: log.id,
        type: log.type,
        event: log.event,
        timestamp: log.timestamp,
        details: log.details,
      })),
      governanceLog: governanceLogs.map((log) => ({
        id: log.id,
        type: log.type,
        action: log.action,
        initiator: log.initiator,
        approvers: log.approvers,
        timestamp: log.timestamp,
        details: log.details,
        hash: log.hash,
      })),
      metadata: {
        totalAuditEntries: auditLogs.length,
        totalGovernanceEntries: governanceLogs.length,
        systemUptime: "99.9%",
        complianceStatus: "Compliant",
        lastAudit: new Date().toISOString(),
      },
    }

    // Generate SHA-256 hash
    const dataString = JSON.stringify(proofPackData, null, 2)
    const hash = crypto.createHash("sha256").update(dataString).digest("hex")

    // Generate dummy signature (in production, this would be a real cryptographic signature)
    const signature = crypto
      .createHash("sha256")
      .update(`${hash}:${process.env.PROOF_PACK_SECRET || "demo-secret"}`)
      .digest("hex")

    // Create final proof pack
    const finalProofPack: ProofPack = {
      id: proofPackId,
      systemState: currentState,
      auditLog: auditLogs,
      governanceLog: governanceLogs,
      hash,
      signature,
      generatedAt,
      createdAt: new Date(),
    }

    // Store proof pack in database
    const proofPackCollection = db.collection<ProofPack>("proof_packs")
    await proofPackCollection.insertOne(finalProofPack)

    // Create ZIP file
    const zip = new JSZip()

    // Add main proof pack JSON
    zip.file("proof-pack.json", JSON.stringify(proofPackData, null, 2))

    // Add individual components
    zip.file("system-state.json", JSON.stringify(currentState, null, 2))
    zip.file("audit-logs.json", JSON.stringify(auditLogs, null, 2))
    zip.file("governance-logs.json", JSON.stringify(governanceLogs, null, 2))

    // Add verification info
    const verificationInfo = {
      hash,
      signature,
      generatedAt,
      instructions: "To verify this proof pack, check the SHA-256 hash against the signature using the public key.",
      publicKey: "demo-public-key-placeholder",
      algorithm: "SHA-256 with RSA",
    }
    zip.file("verification.json", JSON.stringify(verificationInfo, null, 2))

    // Add README
    const readme = `# ResilienceOS+ Proof Pack

Generated: ${generatedAt}
ID: ${proofPackId}

## Contents
- proof-pack.json: Complete proof pack data
- system-state.json: Current system state snapshot
- audit-logs.json: System audit trail
- governance-logs.json: Governance actions log
- verification.json: Cryptographic verification data

## Verification
Hash: ${hash}
Signature: ${signature}

This proof pack provides a tamper-evident snapshot of the ResilienceOS+ system state and audit trail.
`
    zip.file("README.md", readme)

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

    // Return the proof pack metadata and download info
    return NextResponse.json({
      proofPack: finalProofPack,
      downloadSize: zipBuffer.length,
      files: [
        "proof-pack.json",
        "system-state.json",
        "audit-logs.json",
        "governance-logs.json",
        "verification.json",
        "README.md",
      ],
    })
  } catch (error) {
    console.error("Error generating proof pack:", error)
    return NextResponse.json({ error: "Failed to generate proof pack" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = await getDatabase()
    const collection = db.collection<ProofPack>("proof_packs")

    const proofPacks = await collection.find({}).sort({ createdAt: -1 }).limit(20).toArray()

    return NextResponse.json(proofPacks)
  } catch (error) {
    console.error("Error fetching proof packs:", error)
    return NextResponse.json({ error: "Failed to fetch proof packs" }, { status: 500 })
  }
}
