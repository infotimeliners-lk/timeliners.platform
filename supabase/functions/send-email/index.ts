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
  body{background:#f0f2f5;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased}
  .wrap{max-width:520px;margin:0 auto;padding:40px 16px 60px}
  .card{background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.06),0 8px 32px rgba(0,0,0,.07)}
  .top{background:#1d1d1f;padding:24px 36px;display:flex;align-items:center;justify-content:space-between}
  .logo{font-size:18px;font-weight:800;color:#FE730A;letter-spacing:-.3px}
  .logo-sub{font-size:11px;font-weight:500;color:rgba(255,255,255,.35);letter-spacing:.5px;text-transform:uppercase;margin-top:2px}
  .accent-bar{width:3px;height:32px;background:#FE730A;border-radius:2px}
  .body{padding:36px}
  .status-tag{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;padding:4px 12px;border-radius:50px;margin-bottom:20px}
  .tag-green{background:rgba(22,163,74,.1);color:#16a34a;border:1px solid rgba(22,163,74,.18)}
  .tag-orange{background:rgba(254,115,10,.1);color:#FE730A;border:1px solid rgba(254,115,10,.18)}
  .tag-red{background:rgba(220,38,38,.08);color:#dc2626;border:1px solid rgba(220,38,38,.15)}
  h2{font-size:22px;font-weight:700;color:#1d1d1f;letter-spacing:-.4px;margin-bottom:10px;line-height:1.3}
  .txt{font-size:15px;color:#555;line-height:1.7;margin-bottom:16px}
  .txt strong{color:#1d1d1f;font-weight:600}
  .info-box{background:#f5f6f8;border-radius:12px;padding:4px 20px;margin:20px 0}
  .row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(0,0,0,.06)}
  .row:last-child{border-bottom:none}
  .row-l{font-size:13px;color:#999;font-weight:500}
  .row-v{font-size:13px;color:#1d1d1f;font-weight:600}
  .row-v.green{color:#16a34a}
  .row-v.orange{color:#FE730A}
  .row-v.red{color:#dc2626}
  .features{margin:20px 0;display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .feat{font-size:13px;color:#444;display:flex;align-items:center;gap:7px;line-height:1.4}
  .feat-dot{width:6px;height:6px;min-width:6px;border-radius:50%;background:#FE730A}
  .feat-dot.off{background:#ddd}
  .cta{display:block;background:#FE730A;color:#fff;font-size:14px;font-weight:700;
       padding:14px 28px;border-radius:50px;text-decoration:none;text-align:center;
       margin:24px 0 4px;letter-spacing:-.1px;box-shadow:0 4px 16px rgba(254,115,10,.28)}
  .divider{border:none;border-top:1px solid #eee;margin:24px 0}
  .note{font-size:12px;color:#aaa;line-height:1.7}
  .note a{color:#FE730A;text-decoration:none}
  .footer{text-align:center;padding:24px 36px 32px;background:#fafafa;border-top:1px solid #f0f0f0}
  .footer-logo{font-size:13px;font-weight:700;color:#1d1d1f;margin-bottom:6px}
  .footer-txt{font-size:12px;color:#bbb;line-height:1.7}
  .footer-txt a{color:#FE730A;text-decoration:none}
`;

function shell(tag: string, tagClass: string, content: string, footerNote = "") {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${css}</style></head><body>
<div class="wrap"><div class="card">
  <div class="top">
    <div><div class="logo">TimeLiners</div><div class="logo-sub">Video Editor Platform</div></div>
    <div class="accent-bar"></div>
  </div>
  <div class="body">
    <div class="status-tag ${tagClass}">${tag}</div>
    ${content}
    ${footerNote ? `<hr class="divider"><p class="note">${footerNote}</p>` : ""}
  </div>
  <div class="footer">
    <div class="footer-logo">TimeLiners</div>
    <div class="footer-txt">
      Made in Sri Lanka &nbsp;·&nbsp; <a href="${SITE}">${SITE}</a><br>
      Questions? <a href="${SUPPORT_WA}">WhatsApp us</a> or reply to this email
    </div>
  </div>
</div></div></body></html>`;
}

function tplProConfirmed({ name, plan, expires }: { name: string; plan: string; expires: string }) {
  const expFormatted = new Date(expires).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return {
    subject: `Your Pro plan is now active — TimeLiners`,
    html: shell("Pro Activated", "tag-green", `
      <h2>You're now on Pro, ${name}.</h2>
      <p class="txt">Your payment has been verified. Your <strong>${plan}</strong> plan is active and your portfolio is fully unlocked.</p>
      <div class="info-box">
        <div class="row"><span class="row-l">Plan</span><span class="row-v">${plan}</span></div>
        <div class="row"><span class="row-l">Status</span><span class="row-v green">Active</span></div>
        <div class="row"><span class="row-l">Renew before</span><span class="row-v">${expFormatted}</span></div>
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
      <a class="cta" href="${SITE}">View My Portfolio</a>`,
      `To renew when your plan expires, visit <a href="${PAYMENT_URL}">timeliners.lk/payment.html</a>.`
    ),
  };
}

function tplPaymentRejected({ name, reason }: { name: string; reason: string }) {
  return {
    subject: `Action required: Payment slip issue — TimeLiners`,
    html: shell("Payment Issue", "tag-red", `
      <h2>We couldn't verify your slip, ${name}.</h2>
      <p class="txt">We reviewed your payment slip but were unable to confirm it.</p>
      <div class="info-box">
        <div class="row"><span class="row-l">Reason</span><span class="row-v red">${reason}</span></div>
      </div>
      <p class="txt">Please make the transfer again if needed and upload a clear photo or screenshot of the bank confirmation.</p>
      <a class="cta" href="${PAYMENT_URL}">Resubmit Payment Slip</a>`,
      `Need help? <a href="${SUPPORT_WA}">Contact us on WhatsApp</a> and we'll sort it out.`
    ),
  };
}

function tplExpiring3Day({ name, plan, expires }: { name: string; plan: string; expires: string }) {
  const expFormatted = new Date(expires).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return {
    subject: `Your Pro plan expires in 3 days — TimeLiners`,
    html: shell("Expiring Soon", "tag-orange", `
      <h2>Your plan expires on ${expFormatted}.</h2>
      <p class="txt">Hi ${name}, your <strong>${plan}</strong> subscription expires in 3 days. Renew now to keep your Pro features active.</p>
      <div class="info-box">
        <div class="row"><span class="row-l">Plan</span><span class="row-v">${plan}</span></div>
        <div class="row"><span class="row-l">Expires</span><span class="row-v orange">${expFormatted}</span></div>
        <div class="row"><span class="row-l">Grace period after expiry</span><span class="row-v">7 days</span></div>
      </div>
      <a class="cta" href="${PAYMENT_URL}">Renew Pro Plan</a>`,
      `Transfer to Sampath Bank · Account 1085 5522 6551 · R M C P Rathnayake, then upload your slip at the link above.`
    ),
  };
}

function tplExpired({ name, plan, expires }: { name: string; plan: string; expires: string }) {
  const expFormatted = new Date(expires).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return {
    subject: `Your TimeLiners Pro plan has expired`,
    html: shell("Plan Expired", "tag-orange", `
      <h2>Your plan expired on ${expFormatted}.</h2>
      <p class="txt">Hi ${name}, your <strong>${plan}</strong> subscription has expired. You have a <strong>7-day grace period</strong> before your account is moved to the Free plan.</p>
      <div class="info-box">
        <div class="row"><span class="row-l">Plan</span><span class="row-v">${plan}</span></div>
        <div class="row"><span class="row-l">Status</span><span class="row-v orange">Expired</span></div>
        <div class="row"><span class="row-l">Downgrade in</span><span class="row-v">7 days</span></div>
      </div>
      <p class="txt">Renew now to avoid losing your verified badge, analytics, social links, and search priority.</p>
      <a class="cta" href="${PAYMENT_URL}">Renew Before Downgrade</a>`,
      `<a href="${SUPPORT_WA}">Contact us on WhatsApp</a> if you need help with your renewal.`
    ),
  };
}

function tplDowngraded({ name, plan }: { name: string; plan: string }) {
  return {
    subject: `Your TimeLiners account has been moved to Free`,
    html: shell("Downgraded to Free", "tag-red", `
      <h2>Your account is now on the Free plan.</h2>
      <p class="txt">Hi ${name}, your <strong>${plan}</strong> subscription was not renewed, so your account has been moved to Free. Your profile and all your projects are still safe.</p>
      <div class="features">
        <div class="feat"><div class="feat-dot off"></div>Priority search ranking</div>
        <div class="feat"><div class="feat-dot off"></div>Verified badge</div>
        <div class="feat"><div class="feat-dot off"></div>Analytics & stats</div>
        <div class="feat"><div class="feat-dot off"></div>Social links</div>
        <div class="feat"><div class="feat-dot off"></div>Hire Me button</div>
        <div class="feat"><div class="feat-dot off"></div>Unlimited projects</div>
      </div>
      <a class="cta" href="${PAYMENT_URL}">Reactivate Pro</a>`,
      `Transfer to Sampath Bank · Account 1085 5522 6551 · R M C P Rathnayake and upload your slip to reactivate.`
    ),
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
