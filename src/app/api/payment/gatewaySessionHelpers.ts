import crypto from "crypto";
import { getAdminSupabase } from "@/app/api/_middleware";
import { MIDTRANS_CHANNEL_MAP, XENDIT_CHANNEL_MAP } from "./paymentChannelMaps";

const supabaseAdmin = getAdminSupabase();

interface CachedGatewaySession {
  gateway: "midtrans" | "xendit";
  payment_method?: string;
  order_id: string;
  token?: string;
  invoice_id?: string;
  redirect_url: string;
  amount: number;
  created_at: number;
}

function getSecretKeyBuffer(): Buffer {
  const raw = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.MIDTRANS_SERVER_KEY || "ige-default-secret-key";
  return crypto.createHash("sha256").update(raw).digest();
}

function buildLockKey(orderPrefix: string): string {
  const hmac = crypto.createHmac("sha256", getSecretKeyBuffer()).update(orderPrefix).digest("hex").slice(0, 20);
  return `pay_lock_${hmac}`;
}

function encryptSession(payload: CachedGatewaySession): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getSecretKeyBuffer(), iv);
  const enc = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${enc.toString("base64")}`;
}

function decryptSession(raw: string): CachedGatewaySession | null {
  try {
    const [ivB64, tagB64, encB64] = raw.split(".");
    if (!ivB64 || !tagB64 || !encB64) return null;
    const decipher = crypto.createDecipheriv("aes-256-gcm", getSecretKeyBuffer(), Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    const dec = Buffer.concat([decipher.update(Buffer.from(encB64, "base64")), decipher.final()]);
    return JSON.parse(dec.toString("utf8"));
  } catch {
    return null;
  }
}

async function readCachedSession(orderPrefix: string): Promise<CachedGatewaySession | null> {
  try {
    const key = buildLockKey(orderPrefix);
    const { data } = await supabaseAdmin.from("landing_settings").select("value").eq("key", key).maybeSingle();
    if (!data?.value) return null;
    return decryptSession(String(data.value));
  } catch {
    return null;
  }
}

async function writeCachedSession(orderPrefix: string, session: CachedGatewaySession): Promise<void> {
  try {
    const key = buildLockKey(orderPrefix);
    await supabaseAdmin.from("landing_settings").upsert({ key, value: encryptSession(session) }, { onConflict: "key" });
  } catch {
    // Ignore cache write errors so payment flow is never blocked
  }
}

export async function clearCachedSessionByOrderId(orderId: string): Promise<void> {
  try {
    const parts = String(orderId || "").split("_");
    if (parts.length >= 3) {
      const orderPrefix = `${parts[0]}_${parts[1]}_${parts[2]}_`;
      await supabaseAdmin.from("landing_settings").delete().eq("key", buildLockKey(orderPrefix));
    }
  } catch {
    // Ignore cleanup errors
  }
}

async function isMidtransSessionStillActive(token: string, orderId: string, authHeader: string, isProd: boolean): Promise<boolean> {
  try {
    const snapBase = isProd ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
    const apiBase = isProd ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";

    const statusRes = await fetch(`${apiBase}/v2/${encodeURIComponent(orderId)}/status`, {
      headers: { Accept: "application/json", Authorization: authHeader },
    });
    const statusJson = await statusRes.json();
    const code = String(statusJson.status_code || "");
    const txStatus = String(statusJson.transaction_status || "");

    if (txStatus === "pending") return true;
    if (["settlement", "capture", "expire", "cancel", "deny", "failure"].includes(txStatus)) return false;

    if (code === "404") {
      const snapRes = await fetch(`${snapBase}/snap/v1/transactions/${encodeURIComponent(token)}`, {
        headers: { Accept: "application/json" },
      });
      if (!snapRes.ok) return false;
      const snapJson = await snapRes.json();
      return !snapJson.error_messages;
    }
    return false;
  } catch {
    return false;
  }
}

async function cancelMidtransOrderIfPending(orderId: string): Promise<void> {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey || !orderId) return;
    const isProd = process.env.MIDTRANS_IS_PRODUCTION === "true";
    const apiBase = isProd ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";
    const authHeader = "Basic " + Buffer.from(`${serverKey}:`).toString("base64");
    await fetch(`${apiBase}/v2/${encodeURIComponent(orderId)}/cancel`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: authHeader },
    });
  } catch {
    // Ignore if transaction was not yet created in Core API
  }
}

async function expireXenditInvoiceIfPending(invoiceId: string): Promise<void> {
  try {
    const secretKey = process.env.XENDIT_SECRET_KEY;
    if (!secretKey || !invoiceId) return;
    const authHeader = "Basic " + Buffer.from(`${secretKey}:`).toString("base64");
    await fetch(`https://api.xendit.co/invoices/${encodeURIComponent(invoiceId)}/expire!`, {
      method: "POST",
      headers: { Authorization: authHeader },
    });
  } catch {
    // Ignore if already expired
  }
}

function formatIdPhone(raw: string): string {
  const digits = String(raw || "").replace(/[^0-9]/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  return digits.startsWith("62") ? `+${digits}` : `+62${digits}`;
}

export async function createMidtransTransaction(
  orderId: string,
  baseAmount: number,
  feeAmount: number,
  studentName: string,
  program: string,
  month: string,
  email: string,
  finishUrl = "https://www.ibraglobalenglish.uk/checkout",
  phone = "",
  paymentMethod?: string
) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY belum dikonfigurasi di server.");
  const isProd = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const endpoint = isProd ? "https://app.midtrans.com/snap/v1/transactions" : "https://app.sandbox.midtrans.com/snap/v1/transactions";
  const authHeader = "Basic " + Buffer.from(`${serverKey}:`).toString("base64");
  const totalAmount = baseAmount + feeAmount;

  const parts = orderId.split("_");
  const orderPrefix = parts.length >= 3 ? `${parts[0]}_${parts[1]}_${parts[2]}_` : orderId;
  const cached = await readCachedSession(orderPrefix);

  if (cached) {
    const ageMs = Date.now() - cached.created_at;
    const sameMethod = !paymentMethod || cached.payment_method === paymentMethod;
    if (cached.gateway === "midtrans" && sameMethod && cached.token && cached.amount === totalAmount && ageMs < 22 * 3600 * 1000) {
      const active = await isMidtransSessionStillActive(cached.token, cached.order_id, authHeader, isProd);
      if (active) {
        return { gateway: "midtrans", token: cached.token, redirect_url: cached.redirect_url, order_id: cached.order_id, reused: true };
      }
    }
    if (cached.gateway === "midtrans" && cached.order_id) await cancelMidtransOrderIfPending(cached.order_id);
    if (cached.gateway === "xendit" && cached.invoice_id) await expireXenditInvoiceIfPending(cached.invoice_id);
  }

  const items = [{ id: `SPP-${month}`, price: baseAmount, quantity: 1, name: `SPP ${program} (${month})`.slice(0, 50) }];
  if (feeAmount > 0) items.push({ id: "ADMIN-FEE", price: feeAmount, quantity: 1, name: "Biaya Layanan Payment Gateway" });

  const enabledPayments = paymentMethod ? MIDTRANS_CHANNEL_MAP[paymentMethod] : undefined;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: authHeader },
    body: JSON.stringify({
      transaction_details: { order_id: orderId.slice(0, 50), gross_amount: totalAmount },
      item_details: items,
      customer_details: { first_name: studentName.slice(0, 50), email: email || "parent@ibraglobalenglish.uk", ...(phone ? { phone: phone.slice(0, 20) } : {}) },
      ...(enabledPayments ? { enabled_payments: enabledPayments } : {}),
      callbacks: { finish: finishUrl },
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error_messages?.join(", ") || "Gagal membuat transaksi Midtrans.");

  await writeCachedSession(orderPrefix, {
    gateway: "midtrans",
    payment_method: paymentMethod,
    order_id: orderId,
    token: json.token,
    redirect_url: json.redirect_url,
    amount: totalAmount,
    created_at: Date.now(),
  });

  return { gateway: "midtrans", token: json.token, redirect_url: json.redirect_url, order_id: orderId };
}

export async function createXenditInvoice(
  externalId: string,
  baseAmount: number,
  feeAmount: number,
  studentName: string,
  program: string,
  month: string,
  email: string,
  redirectUrl?: string,
  phone = "",
  paymentMethod?: string
) {
  const secretKey = process.env.XENDIT_SECRET_KEY;
  if (!secretKey) throw new Error("XENDIT_SECRET_KEY belum dikonfigurasi di server.");
  const authHeader = "Basic " + Buffer.from(`${secretKey}:`).toString("base64");
  const totalAmount = baseAmount + feeAmount;

  const parts = externalId.split("_");
  const orderPrefix = parts.length >= 3 ? `${parts[0]}_${parts[1]}_${parts[2]}_` : externalId;
  const cached = await readCachedSession(orderPrefix);

  if (cached?.gateway === "midtrans" && cached.order_id) {
    await cancelMidtransOrderIfPending(cached.order_id);
  }

  try {
    const listRes = await fetch("https://api.xendit.co/v2/invoices?statuses=%5B%22PENDING%22%5D&limit=50", {
      headers: { Authorization: authHeader },
    });
    if (listRes.ok) {
      const pendingList = await listRes.json();
      const matching = (Array.isArray(pendingList) ? pendingList : []).filter((inv: any) => String(inv.external_id || "").startsWith(orderPrefix));
      for (const inv of matching) {
        const expMs = new Date(inv.expiry_date || 0).getTime();
        if (inv.amount === totalAmount && expMs > Date.now() + 120000 && inv.invoice_url) {
          return { gateway: "xendit", invoice_url: inv.invoice_url, redirect_url: inv.invoice_url, order_id: inv.external_id, reused: true };
        }
        if (inv.id) await expireXenditInvoiceIfPending(inv.id);
      }
    }
  } catch {
    // Proceed to create invoice if listing fails
  }

  const fees = feeAmount > 0 ? [{ type: "Biaya Layanan Transaksi Otomatis", value: feeAmount }] : undefined;
  const items = [{ name: `SPP ${program} (${month})`, quantity: 1, price: baseAmount, category: "Education" }];
  if (feeAmount > 0) items.push({ name: "Biaya Layanan Transaksi Otomatis", quantity: 1, price: feeAmount, category: "Service Fee" });
  const mobile = formatIdPhone(phone);
  const targetUrl = redirectUrl || "https://www.ibraglobalenglish.uk/parent";
  const failUrl = targetUrl.includes("/checkout") ? "https://www.ibraglobalenglish.uk/checkout" : targetUrl;

  const xenditMethods = paymentMethod ? XENDIT_CHANNEL_MAP[paymentMethod] : undefined;

  const res = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify({
      external_id: externalId,
      amount: totalAmount,
      fees,
      items,
      ...(xenditMethods ? { payment_methods: xenditMethods } : {}),
      customer: { given_names: studentName.slice(0, 50) || "Siswa IGE", email: email || "parent@ibraglobalenglish.uk", ...(mobile ? { mobile_number: mobile } : {}) },
      description: `Pembayaran SPP ${program} - ${studentName} (Bulan ${month})`,
      payer_email: email || "parent@ibraglobalenglish.uk",
      currency: "IDR",
      success_redirect_url: targetUrl,
      failure_redirect_url: failUrl,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Gagal membuat invoice Xendit.");

  await writeCachedSession(orderPrefix, {
    gateway: "xendit",
    order_id: externalId,
    invoice_id: json.id,
    redirect_url: json.invoice_url,
    amount: totalAmount,
    created_at: Date.now(),
  });

  return { gateway: "xendit", invoice_url: json.invoice_url, redirect_url: json.invoice_url, order_id: externalId };
}
