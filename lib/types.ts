export interface SystemState {
  _id?: string
  mode: "normal" | "cyber" | "liquidity"
  nav: number
  liquidity: number
  timestamp: string
  createdAt: Date
  updatedAt: Date
}

export interface LogEntry {
  _id?: string
  id: string
  type: "crisis" | "reset" | "governance"
  event: string
  timestamp: string
  details?: string
  createdAt: Date
}

export interface GovernanceLogEntry {
  _id?: string
  id: string
  type: "approval" | "rejection" | "override" | "multisig" | "compliance"
  action: string
  initiator: string
  approvers: string[]
  timestamp: string
  details: string
  hash: string
  immutable: boolean
  createdAt: Date
}

export interface AuditTrail {
  _id?: string
  id: string
  entityType: "system" | "user" | "transaction" | "governance"
  entityId: string
  action: string
  before: any
  after: any
  userId: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

export interface ProofPack {
  _id?: string
  id: string
  systemState: SystemState
  auditLog: LogEntry[]
  governanceLog: GovernanceLogEntry[]
  hash: string
  signature: string
  generatedAt: string
  createdAt: Date
}
