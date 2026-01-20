// This service handles the "End-to-End Encryption" requirement.
// Data is encrypted in the browser before ever touching the "Edge" (simulated).

export class CryptoService {
  
  // Generate a random key for the session (Simulating the Master Key)
  async generateMasterKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  // Encrypt data
  async encryptData(data: string, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encryptedContent = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encodedData
    );

    return {
      ciphertext: this.arrayBufferToBase64(encryptedContent),
      iv: this.arrayBufferToBase64(iv),
    };
  }

  // Decrypt data
  async decryptData(ciphertext: string, iv: string, key: CryptoKey): Promise<string> {
    const decoder = new TextDecoder();
    const encryptedData = this.base64ToArrayBuffer(ciphertext);
    const ivArr = this.base64ToArrayBuffer(iv);

    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivArr,
      },
      key,
      encryptedData
    );

    return decoder.decode(decryptedContent);
  }

  // Mock Shamir's Secret Sharing (Splitting the key logic)
  // In a real app, we would export the raw key bytes and run SSS algorithm.
  // Here we simulate it for the UI demonstration.
  simulateKeySharding(count: number, threshold: number): string[] {
    const shards = [];
    for (let i = 0; i < count; i++) {
      const randomSegment = Math.random().toString(36).substring(2, 15);
      shards.push(`shard-${i + 1}-${randomSegment}-${threshold}of${count}`);
    }
    return shards;
  }

  // Helpers
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

export const cryptoService = new CryptoService();