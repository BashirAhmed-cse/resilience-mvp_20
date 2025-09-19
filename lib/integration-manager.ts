// Integration Manager - Orchestrates all external integrations
import { type MPCCustodyConnector, createMPCCustodyConnector } from "@/connectors/mpc-custody"
import { type KYCAMLConnector, createKYCAMLConnector } from "@/connectors/kyc-aml"

export class IntegrationManager {
  private mpcCustody: MPCCustodyConnector
  private kycAml: KYCAMLConnector

  constructor() {
    this.mpcCustody = createMPCCustodyConnector()
    this.kycAml = createKYCAMLConnector()
  }

  // MPC Custody operations
  async initiateCustodyTransaction(type: string, params: any) {
    return this.mpcCustody.initializeTransaction(type as any, params)
  }

  async getCustodyBalance(assetId: string) {
    return this.mpcCustody.getBalance(assetId)
  }

  async emergencyFreezeCustody(assetId: string) {
    return this.mpcCustody.emergencyFreeze(assetId)
  }

  // KYC/AML operations
  async performKYC(userId: string, userData: any) {
    return this.kycAml.initiateKYC(userId, userData)
  }

  async screenTransaction(transaction: any) {
    return this.kycAml.screenTransaction(transaction)
  }

  async getComplianceStatus(userId: string) {
    return this.kycAml.getKYCStatus(userId)
  }

  // Health check for all integrations
  async healthCheck() {
    const results = {
      mpcCustody: { status: "unknown", latency: 0 },
      kycAml: { status: "unknown", latency: 0 },
      timestamp: new Date().toISOString(),
    }

    try {
      const start = Date.now()
      await this.mpcCustody.getBalance("test-asset")
      results.mpcCustody = {
        status: "healthy",
        latency: Date.now() - start,
      }
    } catch (error) {
      results.mpcCustody = {
        status: "error",
        latency: 0,
      }
    }

    try {
      const start = Date.now()
      await this.kycAml.getKYCStatus("test-user")
      results.kycAml = {
        status: "healthy",
        latency: Date.now() - start,
      }
    } catch (error) {
      results.kycAml = {
        status: "error",
        latency: 0,
      }
    }

    return results
  }
}

// Singleton instance
export const integrationManager = new IntegrationManager()
