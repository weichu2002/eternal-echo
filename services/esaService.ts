// This service abstracts the interaction with Alibaba Cloud ESA Edge KV.
// REAL IMPLEMENTATION: Calls the integrated Edge Function via relative path.

import { EncryptedPacket, VaultStatus, DigitalLegacy, VisitLog, Tribute, InteractionData, AccessLevel } from "../types";

// 使用相对路径，浏览器会自动指向当前域名下的 /api/vault
// 这由 esa.jsonc 中的 routes 配置通过 ESA Pages 自动处理路由
const EDGE_API_URL = "/api/vault"; 

const KV_NAMESPACE = "eternal-echo-vault";
const MOCK_PLAINTEXT_KEY = "mock-legacy-plaintext"; 

export const esaService = {
  // Deploy to Edge (Real KV via Edge Function)
  deployToEdge: async (packet: EncryptedPacket): Promise<{ success: boolean; nodes: string[] }> => {
    
    try {
      console.log(`Connecting to ESA Integrated Edge Function: ${EDGE_API_URL}...`);
      
      // 1. Send the encrypted packet to the Edge Function
      const response = await fetch(EDGE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: KV_NAMESPACE, 
          value: JSON.stringify(packet)
          // expirationTTL removed for permanent storage
        })
      });

      const resJson = await response.json();

      if (!response.ok) {
        throw new Error(`Edge API Error: ${resJson.error || response.statusText}`);
      }
      
      // Also set the status flag in KV
      await fetch(EDGE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: KV_NAMESPACE + "_STATUS",
          value: VaultStatus.FROZEN
        })
      });

    } catch (e) {
      console.error("Failed to deploy to real Edge KV:", e);
      // Fallback to LocalStorage for offline demo/testing
      console.warn("Falling back to LocalStorage simulation...");
      localStorage.setItem(KV_NAMESPACE, JSON.stringify(packet));
      localStorage.setItem(KV_NAMESPACE + "_STATUS", VaultStatus.FROZEN);
    }

    return {
      success: true,
      nodes: ["ESA-Singapore-01", "ESA-Frankfurt-04", "ESA-SiliconValley-09"]
    };
  },

  // Helper for Demo: Save plaintext mock
  saveMockPlaintextForDemo: (data: DigitalLegacy) => {
    localStorage.setItem(MOCK_PLAINTEXT_KEY, JSON.stringify(data));
  },

  // Check Pulse (Real KV Read)
  checkPulse: async (): Promise<VaultStatus> => {
    try {
      // Add timestamp to prevent caching
      const response = await fetch(`${EDGE_API_URL}?key=${KV_NAMESPACE}_STATUS&_t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (response.ok) {
        const json = await response.json();
        if (json.found) {
          return json.data as VaultStatus;
        }
      }
      throw new Error("KV key not found on Edge");
    } catch (e) {
      console.warn("Edge KV check failed (using fallback):", e);
      const status = localStorage.getItem(KV_NAMESPACE + "_STATUS") as VaultStatus;
      return status || VaultStatus.UNINITIALIZED;
    }
  },

  // Retrieve Data (Real KV Read)
  retrieveFromEdge: async (): Promise<EncryptedPacket | null> => {
    try {
      const response = await fetch(`${EDGE_API_URL}?key=${KV_NAMESPACE}&_t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (response.ok) {
        const json = await response.json();
        if (json.found) {
          return typeof json.data === 'string' ? JSON.parse(json.data) : json.data;
        }
      }
      throw new Error("KV key not found on Edge");
    } catch (e) {
      console.warn("Edge KV retrieve failed (using fallback):", e);
      const data = localStorage.getItem(KV_NAMESPACE);
      return data ? JSON.parse(data) : null;
    }
  },

  // --- Interaction Methods ---

  // 记录访问 (匿名)
  recordVisit: async (group: AccessLevel | 'owner') => {
    if (group === 'owner') return; // Owner visits don't count as public legacy visits
    const log: VisitLog = {
      timestamp: Date.now(),
      group
    };
    
    try {
      await fetch(EDGE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'append_interaction',
          key: KV_NAMESPACE,
          payload: { type: 'log', data: log }
        })
      });
    } catch (e) {
      console.error("Failed to log visit to Edge:", e);
    }
  },

  // 留下贡品 (花/烛)
  leaveTribute: async (tribute: Tribute) => {
    try {
      await fetch(EDGE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'append_interaction',
          key: KV_NAMESPACE,
          payload: { type: 'tribute', data: tribute }
        })
      });
    } catch (e) {
      console.error("Failed to leave tribute on Edge:", e);
    }
  },

  // 获取互动数据
  fetchInteractions: async (): Promise<InteractionData> => {
    try {
      // Critical: Add cache busting
      const response = await fetch(`${EDGE_API_URL}?key=${KV_NAMESPACE}&type=interactions&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (response.ok) {
        const json = await response.json();
        if (json.found) {
          return json.data as InteractionData;
        }
      }
    } catch (e) {
      console.warn("Edge KV interactions check failed:", e);
    }
    return { logs: [], tributes: [] };
  }
};