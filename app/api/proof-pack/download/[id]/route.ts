import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { ProofPack } from "@/lib/types"
import JSZip from "jszip"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDatabase()
    const collection = db.collection<ProofPack>("proof_packs")

    const proofPack = await collection.findOne({ id: params.id })

    if (!proofPack) {
      return NextResponse.json({ error: "Proof pack not found" }, { status: 404 })
    }

    // Recreate the ZIP file
    const zip = new JSZip()

    // Main proof pack data
    const proofPackData = {
      id: proofPack.id,
      generatedAt: proofPack.generatedAt,
      systemState: {
        mode: proofPack.systemState.mode,
        nav: proofPack.systemState.nav,
        liquidity: proofPack.systemState.liquidity,
        timestamp: proofPack.systemState.timestamp,
        status: proofPack.systemState.mode === "normal" ? "Operational" : "Crisis Mode Active",
      },
      auditLog: proofPack.auditLog,
      governanceLog: proofPack.governanceLog,
      hash: proofPack.hash,
      signature: proofPack.signature,
    }

    zip.file("proof-pack.json", JSON.stringify(proofPackData, null, 2))
    zip.file("system-state.json", JSON.stringify(proofPack.systemState, null, 2))
    zip.file("audit-logs.json", JSON.stringify(proofPack.auditLog, null, 2))
    zip.file("governance-logs.json", JSON.stringify(proofPack.governanceLog, null, 2))

    const verificationInfo = {
      hash: proofPack.hash,
      signature: proofPack.signature,
      generatedAt: proofPack.generatedAt,
      instructions: "To verify this proof pack, check the SHA-256 hash against the signature.",
      algorithm: "SHA-256",
    }
    zip.file("verification.json", JSON.stringify(verificationInfo, null, 2))

    const readme = `# ResilienceOS+ Proof Pack

Generated: ${proofPack.generatedAt}
ID: ${proofPack.id}

## Verification
Hash: ${proofPack.hash}
Signature: ${proofPack.signature}

This proof pack provides a tamper-evident snapshot of the ResilienceOS+ system.
`
    zip.file("README.md", readme)

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

    // Return as downloadable file
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="resilience-proof-pack-${params.id}.zip"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Error downloading proof pack:", error)
    return NextResponse.json({ error: "Failed to download proof pack" }, { status: 500 })
  }
}
