export interface CrisisScenario {
  id: string
  name: string
  description: string
  navImpact: number // Percentage impact (0.85 = 15% drop)
  liquidityTarget: number // Target liquidity percentage
  duration: number // Estimated duration in minutes
  severity: "low" | "medium" | "high" | "critical"
  triggers: string[]
  mitigations: string[]
}

export const CRISIS_SCENARIOS: Record<string, CrisisScenario> = {
  cyber: {
    id: "cyber",
    name: "Cyber Security Event",
    description: "Coordinated cyber attack on critical infrastructure",
    navImpact: 0.85, // 15% drop
    liquidityTarget: 15,
    duration: 120, // 2 hours
    severity: "high",
    triggers: ["Unauthorized access detected", "Data integrity compromise", "System availability impact"],
    mitigations: ["Isolate affected systems", "Activate backup infrastructure", "Implement emergency protocols"],
  },
  liquidity: {
    id: "liquidity",
    name: "Liquidity Freeze",
    description: "Market-wide liquidity constraints affecting operations",
    navImpact: 0.92, // 8% drop
    liquidityTarget: 8,
    duration: 180, // 3 hours
    severity: "medium",
    triggers: ["Market volatility spike", "Credit facility restrictions", "Counterparty risk elevation"],
    mitigations: [
      "Activate emergency credit lines",
      "Reduce non-essential operations",
      "Implement capital preservation measures",
    ],
  },
  lenderPull: {
    id: "lender-pull",
    name: "Lender Credit Pull",
    description: "Major lenders withdrawing credit facilities",
    navImpact: 0.78, // 22% drop
    liquidityTarget: 5,
    duration: 240, // 4 hours
    severity: "critical",
    triggers: ["Credit rating downgrade", "Covenant breach", "Market confidence loss"],
    mitigations: ["Emergency funding activation", "Asset liquidation protocols", "Stakeholder communication plan"],
  },
}

export function getCrisisScenario(scenarioId: string): CrisisScenario | null {
  return CRISIS_SCENARIOS[scenarioId] || null
}

export function calculateCrisisImpact(
  currentState: { nav: number; liquidity: number },
  scenario: CrisisScenario,
): { nav: number; liquidity: number } {
  return {
    nav: Math.floor(currentState.nav * scenario.navImpact),
    liquidity: scenario.liquidityTarget,
  }
}
