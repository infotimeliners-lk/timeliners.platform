import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM = "TimeLiners <noreply@timeliners.site>";
const SITE = "https://timeliners.lk";
const PAYMENT_URL = `${SITE}/payment.html`;
const SUPPORT_WA = "https://wa.me/94XXXXXXXXX"; // replace with your WA number

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── SHARED STYLES ─────────────────────────────────────────────────────────────
const css = `
  body { margin:0; padding:0; background:#f5f5f7; font-family:'Helvetica Neue',Arial,sans-serif; }
  .wrap { max-width:560px; margin:0 auto; padding:32px 16px; }
  .card { background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 2px 16px rgba(0,0,0,.07); }
  .header { background:#1d1d1f; padding:28px 32px; text-align:center; }
  .logo { font-size:22px; font-weight:800; color:#FE730A; letter-spacing:-.5px; }
  .body { padding:32px; }
  .hi { font-size:20px; font-weight:700; color:#1d1d1f; margin:0 0 8px; }
  .txt { font-size:15px; color:#444; line-height:1.65; margin:0 0 16px; }
  .txt strong { color:#1d1d1f; }
  .btn { display:inline-block; background:#FE730A; color:#fff !important; font-size:15px; font-weight:700;
         padding:14px 32px; border-radius:50px; text-decoration:none; margin:8px 0 20px; }
  .info-box { background:#f5f5f7; border-radius:10px; padding:16px 20px; margin:16px 0; }
  .info-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0;
              border-bottom:1px solid rgba(0,0,0,.06); font-size:14px; }
  .info-row:last-child { border-bottom:none; }
  .info-l { color:#888; }
  .info-v { font-weight:600; color:#1d1d1f; }
  .divider { border:none; border-top:1px solid #eee; margin:20px 0; }
  .footer { text-align:center; padding:20px 32px 28px; font-size:12px; color:#aaa; line-height:1.6; }
  .footer a { color:#FE730A; text-decoration:none; }
  .badge-pro { display:inline-block; background:rgba(22,163,74,.1); color:#16a34a;
               font-size:12px; font-weight:700; padding:3px 12px; border-radius:50px;
               border:1px solid rgba(22,163,74,.2); margin-bottom:16px; }
  .badge-warn { display:inline-block; background:rgba(217,119,6,.1); color:#d97706;
                font-size:12px; font-weight:700; padding:3px 12px; border-radius:50px;
                border:1px solid rgba(217,119,6,.2); margin-bottom:16px; }
  .badge-err { display:inline-block; background:rgba(220,38,38,.08); color:#dc2626;
               font-size:12px; font-weight:700; padding:3px 12px; border-radius:50px;
               border:1px solid rgba(220,38,38,.18); margin-bottom:16px; }
`;

function shell(content: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>${css}</style></head><body>
<div class="wrap"><div class="card">
<div class="header"><div class="logo">TimeLiners</div></div>
${content}
<div class="footer">
  TimeLiners · Made in Sri Lanka 🇱🇰<br>
  <a href="${SITE}">${SITE}</a> · 
  <a href="${SITE}/support.html">Support</a>
</div>
</div></div></body></html>`;
}

// ── EMAIL TEMPLATES ───────────────────────────────────────────────────────────

function tplProConfirmed({ name, plan, expires }: { name: string; plan: string; expires: string }) {
  const expFormatted = new Date(expires).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return {
    subject: "🎉 You're now Pro on TimeLiners!",
    html: shell(`<div class="body">
      <div class="badge-pro">✓ Pro Activated</div>
      <p class="hi">Welcome to Pro, ${name}!</p>
      <p class="txt">Your payment has been verified and your <strong>${plan}</strong> plan is now active. Your portfolio is fully unlocked — go make it shine.</p>
      <div class="info-box">
        <div class="info-row"><span class="info-l">Plan</span><span class="info-v">${plan}</span></div>
        <div class="info-row"><span class="info-l">Status</span><span class="info-v" style="color:#16a34a">Active ✓</span></div>
        <div class="info-row"><span class="info-l">Renews before</span><span class="info-v">${expFormatted}</span></div>
      </div>
      <p class="txt">Here's what's unlocked on your profile:</p>
      <p class="txt">✅ Unlimited projects &nbsp;·&nbsp; ✅ 5GB storage<br>
      ✅ Priority in search &nbsp;·&nbsp; ✅ Verified badge<br>
      ✅ Analytics &nbsp;·&nbsp; ✅ Social links &nbsp;·&nbsp; ✅ Hire Me button</p>
      <a class="btn" href="${SITE}">View My Profile →</a>
      <hr class="divider">
      <p class="txt" style="font-size:13px;color:#888">To renew when your plan expires, visit <a href="${PAYMENT_URL}" style="color:#FE730A">${PAYMENT_URL}</a>. Questions? Reply to this email or contact us on WhatsApp.</p>
    </div>`),
  };
}

function tplPaymentRejected({ name, reason }: { name: string; reason: string }) {
  return {
    subject: "⚠️ Payment slip issue — TimeLiners",
    html: shell(`<div class="body">
      <div class="badge-err">Payment Issue</div>
      <p class="hi">Hi ${name},</p>
      <p class="txt">We received your payment slip but unfortunately we couldn't verify it. Here's why:</p>
      <div class="info-box">
        <div class="info-row"><span class="info-l">Reason</span><span class="info-v" style="color:#dc2626">${reason}</span></div>
      </div>
      <p class="txt">No worries — you can resubmit with the correct slip. Just make the transfer again if needed and upload a clear photo or screenshot of the confirmation.</p>
      <a class="btn" href="${PAYMENT_URL}">Resubmit Payment →</a>
      <hr class="divider">
      <p class="txt" style="font-size:13px;color:#888">If you think this is a mistake or need help, contact us on <a href="${SUPPORT_WA}" style="color:#FE730A">WhatsApp</a>.</p>
    </div>`),
  };
}

function tplExpiring3Day({ name, plan, expires }: { name: string; plan: string; expires: string }) {
  const expFormatted = new Date(expires).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return {
    subject: "⏳ Your Pro plan expires in 3 days — renew now",
    html: shell(`<div class="body">
      <div class="badge-warn">Expiring Soon</div>
      <p class="hi">Hi ${name}, your Pro plan expires soon!</p>
      <p class="txt">Your <strong>${plan}</strong> subscription expires on <strong>${expFormatted}</strong> — that's in just 3 days.</p>
      <p class="txt">Renew now to keep your Pro features active: priority search ranking, verified badge, analytics, social links, and your Hire Me button.</p>
      <a class="btn" href="${PAYMENT_URL}">Renew Pro Now →</a>
      <div class="info-box">
        <div class="info-row"><span class="info-l">Plan</span><span class="info-v">${plan}</span></div>
        <div class="info-row"><span class="info-l">Expires</span><span class="info-v">${expFormatted}</span></div>
        <div class="info-row"><span class="info-l">Grace period after expiry</span><span class="info-v">7 days</span></div>
      </div>
      <hr class="divider">
      <p class="txt" style="font-size:13px;color:#888">Transfer to Sampath Bank · 1085 5522 6551 · R M C P Rathnayake and upload your slip at the link above.</p>
    </div>`),
  };
}

function tplExpired({ name, plan, expires }: { name: string; plan: string; expires: string }) {
  const expFormatted = new Date(expires).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return {
    subject: "Your TimeLiners Pro plan has expired",
    html: shell(`<div class="body">
      <div class="badge-warn">Plan Expired</div>
      <p class="hi">Hi ${name}, your plan has expired.</p>
      <p class="txt">Your <strong>${plan}</strong> subscription expired on <strong>${expFormatted}</strong>.</p>
      <p class="txt">Don't worry — you have a <strong>7-day grace period</strong> before your account is downgraded to Free. Renew now to avoid losing your Pro features.</p>
      <a class="btn" href="${PAYMENT_URL}">Renew Before Downgrade →</a>
      <div class="info-box">
        <div class="info-row"><span class="info-l">Status</span><span class="info-v" style="color:#d97706">Expired</span></div>
        <div class="info-row"><span class="info-l">Downgrade date</span><span class="info-v">7 days from expiry</span></div>
      </div>
      <hr class="divider">
      <p class="txt" style="font-size:13px;color:#888">Questions? Contact us on <a href="${SUPPORT_WA}" style="color:#FE730A">WhatsApp</a>.</p>
    </div>`),
  };
}

function tplDowngraded({ name, plan }: { name: string; plan: string }) {
  return {
    subject: "Your TimeLiners account has been downgraded to Free",
    html: shell(`<div class="body">
      <div class="badge-err">Downgraded to Free</div>
      <p class="hi">Hi ${name},</p>
      <p class="txt">Your <strong>${plan}</strong> subscription was not renewed, so your account has been moved to the Free plan.</p>
      <p class="txt">Your profile and projects are still safe — you just won't have Pro features until you renew.</p>
      <p class="txt"><strong>What you've lost:</strong><br>
      ❌ Priority search ranking &nbsp;·&nbsp; ❌ Verified badge<br>
      ❌ Analytics &nbsp;·&nbsp; ❌ Social links &nbsp;·&nbsp; ❌ Hire Me button<br>
      ❌ Unlimited projects (limited to 3)</p>
      <a class="btn" href="${PAYMENT_URL}">Reactivate Pro →</a>
      <hr class="divider">
      <p class="txt" style="font-size:13px;color:#888">We'd love to have you back on Pro. Transfer to Sampath Bank · 1085 5522 6551 and upload your slip at the link above.</p>
    </div>`),
  };
}

// ── SEND VIA RESEND ──────────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
  return res.json();
}

// ── HANDLER ──────────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const body = await req.json();
    const { type, email, name, plan, expires, reason } = body;

    if (!type || !email) {
      return new Response(JSON.stringify({ error: "Missing type or email" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    let subject = "";
    let html = "";

    switch (type) {
      case "pro_confirmed": {
        const t = tplProConfirmed({ name: name || "there", plan: plan || "Pro", expires: expires || "" });
        subject = t.subject; html = t.html; break;
      }
      case "payment_rejected": {
        const t = tplPaymentRejected({ name: name || "there", reason: reason || "Payment could not be verified" });
        subject = t.subject; html = t.html; break;
      }
      case "expiring_3day": {
        const t = tplExpiring3Day({ name: name || "there", plan: plan || "Pro", expires: expires || "" });
        subject = t.subject; html = t.html; break;
      }
      case "expired": {
        const t = tplExpired({ name: name || "there", plan: plan || "Pro", expires: expires || "" });
        subject = t.subject; html = t.html; break;
      }
      case "downgraded": {
        const t = tplDowngraded({ name: name || "there", plan: plan || "Pro" });
        subject = t.subject; html = t.html; break;
      }
      default:
        return new Response(JSON.stringify({ error: "Unknown email type: " + type }), {
          status: 400, headers: { ...CORS, "Content-Type": "application/json" },
        });
    }

    const result = await sendEmail(email, subject, html);
    return new Response(JSON.stringify({ ok: true, result }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
