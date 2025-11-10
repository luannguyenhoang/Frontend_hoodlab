/**
 * Utility functions to encode/decode IDs in URLs
 * Uses Base64 encoding for simple obfuscation
 */

export function encodeId(id: number): string {
  // Add a simple salt to make it less obvious
  const salted = `prod_${id}_${Date.now().toString().slice(-6)}`;
  return Buffer.from(salted).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function decodeId(encoded: string): number | null {
  try {
    // Add padding if needed
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    // Extract ID from format: prod_{id}_{timestamp} or ord_{id}_{timestamp}
    const match = decoded.match(/^(prod_|ord_)(\d+)_/);
    if (match && match[2]) {
      return parseInt(match[2], 10);
    }
    return null;
  } catch (error) {
    console.error('Error decoding ID:', error);
    return null;
  }
}

export function encodeOrderId(id: number): string {
  // Add a simple salt to make it less obvious
  const salted = `ord_${id}_${Date.now().toString().slice(-6)}`;
  return Buffer.from(salted).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function decodeOrderId(encoded: string): number | null {
  try {
    // Add padding if needed
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    // Extract ID from format: ord_{id}_{timestamp}
    const match = decoded.match(/^ord_(\d+)_/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  } catch (error) {
    console.error('Error decoding order ID:', error);
    return null;
  }
}

