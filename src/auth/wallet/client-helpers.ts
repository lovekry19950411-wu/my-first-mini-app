/**
 * HMAC-SHA256(nonce), hex — Edge-safe (Web Crypto), matches Node HMAC output.
 */
export async function hashNonce({ nonce }: { nonce: string }): Promise<string> {
  const secret =
    process.env.HMAC_SECRET_KEY ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      'Set HMAC_SECRET_KEY, AUTH_SECRET, or NEXTAUTH_SECRET for wallet auth',
    );
  }
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(nonce));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
