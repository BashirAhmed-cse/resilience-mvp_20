"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Package, Shield, Hash, Clock, FileText, CheckCircle, Loader2 } from "lucide-react"
import type { ProofPack } from "@/lib/types"

export function ProofPackGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [recentProofPacks, setRecentProofPacks] = useState<ProofPack[]>([])
  const [lastGenerated, setLastGenerated] = useState<ProofPack | null>(null)

  const generateProofPack = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/proof-pack", { method: "POST" })
      if (!response.ok) throw new Error("Failed to generate proof pack")

      const data = await response.json()
      setLastGenerated(data.proofPack)

      // Refresh the list
      await fetchRecentProofPacks()
    } catch (error) {
      console.error("Error generating proof pack:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const fetchRecentProofPacks = async () => {
    try {
      const response = await fetch("/api/proof-pack")
      if (response.ok) {
        const data = await response.json()
        setRecentProofPacks(data)
      }
    } catch (error) {
      console.error("Error fetching proof packs:", error)
    }
  }

  const downloadProofPack = async (id: string) => {
    try {
      const response = await fetch(`/api/proof-pack/download/${id}`)
      if (!response.ok) throw new Error("Failed to download proof pack")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `resilience-proof-pack-${id}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading proof pack:", error)
    }
  }

  // Load recent proof packs on mount
  useState(() => {
    fetchRecentProofPacks()
  })

  return (
    <div className="space-y-6">
      {/* Generator Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Proof Pack Generator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate tamper-evident snapshots of system state and audit trails for external verification
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span>SHA-256 Hash</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>JSON + ZIP Export</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span>UTC Timestamps</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <span>Immutable Logs</span>
              </div>
            </div>

            <Button onClick={generateProofPack} disabled={isGenerating} className="w-full" size="lg">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Proof Pack...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  Generate Proof Pack
                </>
              )}
            </Button>

            {lastGenerated && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Proof Pack Generated Successfully</span>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <div>ID: {lastGenerated.id}</div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-3 w-3" />
                    <span className="font-mono text-xs">{lastGenerated.hash.substring(0, 32)}...</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadProofPack(lastGenerated.id)}
                  className="mt-2"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download ZIP
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Proof Packs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Proof Packs
          </CardTitle>
          <p className="text-sm text-muted-foreground">Previously generated proof packs available for download</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentProofPacks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No proof packs generated yet</p>
              </div>
            ) : (
              recentProofPacks.map((pack) => (
                <div key={pack.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{pack.id}</span>
                      <Badge variant="outline" className="text-xs">
                        {pack.systemState.mode.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Generated: {new Date(pack.generatedAt).toLocaleString()}</div>
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        <span className="font-mono">{pack.hash.substring(0, 16)}...</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadProofPack(pack.id)}>
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
