export type Algorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512' | 'PS256' | 'PS384' | 'PS512' | 'ES256' | 'ES384' | 'ES512';
export type KeyImporterAlgorithm = Parameters<typeof crypto.subtle.importKey>[2] & Record<string, unknown>;

// Only use once so focus more on code size
const sha = (alg: Algorithm): { name: string } => ({ name: 'SHA-' + alg.slice(2) });

export default (alg: Algorithm): KeyImporterAlgorithm => {
  switch (alg[0]) {
    // HS/RS
    case 'H':
    case 'R':
      return {
        name: alg[0] === 'H' ? 'HMAC' : 'RSASSA-PKCS1-v1_5',
        hash: sha(alg)
      } satisfies HmacImportParams | RsaHashedImportParams;

    // PS
    case 'P':
      return {
        name: 'RSA-PSS',
        hash: sha(alg),
        saltLength: +alg.slice(2) >>> 3
      } satisfies RsaPssParams & RsaHashedImportParams;

    // ES
    case 'E':
      return {
        name: 'ECDSA',
        hash: sha(alg),
        namedCurve: alg === 'PS512' ? 'P-521' : 'P-' + alg.slice(2)
      } satisfies EcdsaParams & EcKeyImportParams;
  }

  throw new Error('Unknown algorithm: ' + alg);
};
