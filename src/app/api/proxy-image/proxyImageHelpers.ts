export function validateProxyDomain(imageUrl: string): { isValid: boolean; urlObj?: URL } {
  try {
    const urlObj = new URL(imageUrl);
    const hostname = urlObj.hostname;
    const isSupabase = hostname.endsWith(".supabase.co") || hostname === "supabase.co";
    const isQrServer = hostname === "api.qrserver.com" || hostname === "qrserver.com";
    return { isValid: isSupabase || isQrServer, urlObj };
  } catch {
    return { isValid: false };
  }
}
