import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM = "TimeLiners <noreply@timeliners.site>";
const SITE = "https://timeliners.lk";
const PAYMENT_URL = `${SITE}/payment.html`;
const SUPPORT_WA = "https://wa.me/94771234567";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const css = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#f0f2f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
  .wrap{max-width:480px;margin:0 auto;padding:40px 16px 60px}
  .card{background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 24px rgba(0,0,0,.08)}
  .header{padding:28px 36px 0;text-align:center}
  .logo{font-size:20px;font-weight:800;color:#FE730A;letter-spacing:-.3px;padding-bottom:20px;border-bottom:2px solid #FE730A;display:inline-block}
  .body{padding:32px 36px 36px;text-align:center}
  .tag{display:inline-block;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:4px 14px;border-radius:50px;margin-bottom:20px}
  .tag-green{background:rgba(22,163,74,.1);color:#16a34a}
  .tag-orange{background:rgba(254,115,10,.1);color:#FE730A}
  .tag-red{background:rgba(220,38,38,.08);color:#dc2626}
  h1{font-size:22px;font-weight:700;color:#1d1d1f;letter-spacing:-.4px;line-height:1.3;margin-bottom:14px}
  .txt{font-size:14px;color:#666;line-height:1.75;margin-bottom:12px}
  .txt strong{color:#1d1d1f;font-weight:600}
  .info-box{background:#f5f6f8;border-radius:12px;padding:4px 20px;margin:20px auto;text-align:left;max-width:300px}
  .row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(0,0,0,.06)}
  .row:last-child{border-bottom:none}
  .row-l{font-size:13px;color:#999}
  .row-v{font-size:13px;font-weight:600;color:#1d1d1f}
  .row-v.green{color:#16a34a}
  .row-v.orange{color:#FE730A}
  .row-v.red{color:#dc2626}
  .features{display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;max-width:280px;margin:16px auto;text-align:left}
  .feat{font-size:13px;color:#555;display:flex;align-items:center;gap:7px}
  .feat-dot{width:5px;height:5px;min-width:5px;border-radius:50%;background:#FE730A}
  .feat-dot.off{background:#ddd}
  .cta{display:inline-block;background:#FE730A;color:#ffffff;font-size:14px;font-weight:700;padding:13px 32px;border-radius:50px;text-decoration:none;margin:20px auto 6px;letter-spacing:-.1px}
  .note{font-size:11px;color:#bbb;line-height:1.8;margin-top:8px}
  .note a{color:#FE730A;text-decoration:none}
  .footer{text-align:center;padding:16px 36px 28px;border-top:1px solid #f0f0f0}
  .footer-txt{font-size:11px;color:#bbb;line-height:1.8}
  .footer-txt a{color:#FE730A;text-decoration:none}
`;

function shell(tag: string, tagClass: string, headline: string, body: string) {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${css}</style></head><body>
<div class="wrap"><div class="card">
  <div class="header">
    <div class="logo">TimeLiners</div>
  </div>
  <div class="body">
    <div class="tag ${tagClass}">${tag}</div>
    <h1>${headline}</h1>
    ${body}
  </div>
  <div class="footer">
    <div class="footer-txt">
      Made in Sri Lanka &nbsp;·&nbsp; <a href="${SITE}">timeliners.lk</a><br>
      Questions? <a href="${SUPPORT_WA}">WhatsApp us</a> or reply to this email
    </div>
  </div>
</div></div></body></html>`;
}

function tplProConfirmed({ name, plan, expires }: { name: string; plan: string; expires: string }) {
  const exp = new Date(expires).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return {
    subject: `Your Pro plan is now active — TimeLiners`,
    html: shell("Pro Activated", "tag-green", `You're now on Pro, ${name}.`, `
      <p class="txt">Your payment has been verified. Your <strong>${plan}</strong> plan is active and your portfolio is fully unlocked.</p>
      <div class="info-box">
        <div class="row"><span class="row-l">Plan</span><span class="row-v">${plan}</span></div>
        <div class="row"><span class="row-l">Status</span><span class="row-v green">Active</span></div>
        <div class="row"><span class="row-l">Renew before</span><span class="row-v">${exp}</span></div>
      </div>
      <div class="features">
        <div class="feat"><div class="feat-dot"></div>Unlimited projects</div>
        <div class="feat"><div class="feat-dot"></div>5 GB storage</div>
        <div class="feat"><div class="feat-dot"></div>Priority in search</div>
        <div class="feat"><div class="feat-dot"></div>Verified badge</div>
        <div class="feat"><div class="feat-dot"></div>Analytics & stats</div>
        <div class="feat"><div class="feat-dot"></div>Social links</div>
        <div class="feat"><div class="feat-dot"></div>Hire Me button</div>
      </div>
      <a class="cta" href="${SITE}">View My Portfolio</a>
      <p class="note">To renew when your plan expires, visit <a href="${PAYMENT_URL}">the payment page</a>.</p>
    `),
  };
}

function tplPaymentRejected({ name, reason }: { name: string; reason: string }) {
  return {
    subject: `Action required: Payment slip issue — TimeLiners`,
    html: shell("Payment Issue", "tag-red", `We couldn't verify your slip, ${name}.`, `
      <p class="txt">We reviewed your payment slip but were unable to confirm it.</p>
      <div class="info-box">
        <div class="row"><span class="row-l">Reason</span><span class="row-v red">${reason}</span></div>
      </div>
      <p class="txt">Please upload a clear photo or screenshot of your bank transfer confirmation.</p>
      <a class="cta" href="${PAYMENT_URL}">Resubmit Payment Slip</a>
      <p class="note">Need help? <a href="${SUPPORT_WA}">Contact us on WhatsApp</a>.</p>
    `),
  };
}

function tplExpiring3Day({ name, plan, expires }: { name: string; plan: string; expires: string }) {
  const exp = new Date(expires).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return {
    subject: `Your Pro plan expires in 3 days — TimeLiners`,
    html: shell("Expiring Soon", "tag-orange", `Your plan expires on ${exp}.`, `
      <p class="txt">Hi ${name}, your <strong>${plan}</strong> expires in 3 days. Renew now to keep your Pro features active without interruption.</p>
      <div class="info-box">
        <div class="row"><span class="row-l">Plan</span><span class="row-v">${plan}</span></div>
        <div class="row"><span class="row-l">Expires</span><span class="row-v orange">${exp}</span></div>
        <div class="row"><span class="row-l">Grace period</span><span class="row-v">7 days after expiry</span></div>
      </div>
      <a class="cta" href="${PAYMENT_URL}">Renew Pro Plan</a>
      <p class="note">Transfer to Sampath Bank · 1085 5522 6551 · R M C P Rathnayake<br>then upload your slip at the link above.</p>
    `),
  };
}

function tplExpired({ name, plan, expires }: { name: string; plan: string; expires: string }) {
  const exp = new Date(expires).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return {
    subject: `Your TimeLiners Pro plan has expired`,
    html: shell("Plan Expired", "tag-orange", `Your plan expired on ${exp}.`, `
      <p class="txt">Hi ${name}, your <strong>${plan}</strong> has expired. You have a <strong>7-day grace period</strong> before your account is moved to the Free plan.</p>
      <div class="info-box">
        <div class="row"><span class="row-l">Status</span><span class="row-v orange">Expired</span></div>
        <div class="row"><span class="row-l">Downgrade in</span><span class="row-v">7 days</span></div>
      </div>
      <p class="txt">Renew now to keep your verified badge, analytics, social links, and search priority.</p>
      <a class="cta" href="${PAYMENT_URL}">Renew Before Downgrade</a>
      <p class="note"><a href="${SUPPORT_WA}">Contact us on WhatsApp</a> if you need help.</p>
    `),
  };
}

function tplDowngraded({ name, plan }: { name: string; plan: string }) {
  return {
    subject: `Your TimeLiners account has been moved to Free`,
    html: shell("Downgraded to Free", "tag-red", `Your account is now on the Free plan.`, `
      <p class="txt">Hi ${name}, your <strong>${plan}</strong> was not renewed so your account has been moved to Free. Your profile and projects are still safe.</p>
      <div class="features">
        <div class="feat"><div class="feat-dot off"></div>Priority search</div>
        <div class="feat"><div class="feat-dot off"></div>Verified badge</div>
        <div class="feat"><div class="feat-dot off"></div>Analytics</div>
        <div class="feat"><div class="feat-dot off"></div>Social links</div>
        <div class="feat"><div class="feat-dot off"></div>Hire Me button</div>
        <div class="feat"><div class="feat-dot off"></div>Unlimited projects</div>
      </div>
      <a class="cta" href="${PAYMENT_URL}">Reactivate Pro</a>
      <p class="note">Transfer to Sampath Bank · 1085 5522 6551 · R M C P Rathnayake<br>and upload your slip to reactivate instantly.</p>
    `),
  };
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) throw new Error(`Resend error: ${await res.text()}`);
  return res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { type, email, name, plan, expires, reason } = await req.json();
    if (!type || !email) return new Response(JSON.stringify({ error: "Missing type or email" }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" },
    });

    const n = name || "there", p = plan || "Pro Monthly", e = expires || "";
    let tpl: { subject: string; html: string };

    switch (type) {
      case "pro_confirmed":    tpl = tplProConfirmed({ name: n, plan: p, expires: e }); break;
      case "payment_rejected": tpl = tplPaymentRejected({ name: n, reason: reason || "Payment could not be verified" }); break;
      case "expiring_3day":    tpl = tplExpiring3Day({ name: n, plan: p, expires: e }); break;
      case "expired":          tpl = tplExpired({ name: n, plan: p, expires: e }); break;
      case "downgraded":       tpl = tplDowngraded({ name: n, plan: p }); break;
      default: return new Response(JSON.stringify({ error: "Unknown type: " + type }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const result = await sendEmail(email, tpl.subject, tpl.html);
    return new Response(JSON.stringify({ ok: true, result }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
