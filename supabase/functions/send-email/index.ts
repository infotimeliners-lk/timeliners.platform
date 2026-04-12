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

// Email-client safe shell — no grid, no flexbox on outer elements
function shell(tag: string, tagColor: string, tagBg: string, headline: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Poppins','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f2f5;">
  <tr><td align="center" style="padding:40px 16px 60px;">
    <table width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 24px rgba(0,0,0,.08);">

      <!-- HEADER -->
      <tr><td align="center" style="padding:28px 36px 0;">
        <span style="font-size:20px;font-weight:800;color:#FE730A;letter-spacing:-.3px;padding-bottom:18px;border-bottom:2px solid #FE730A;display:inline-block;font-family:'Poppins',sans-serif;">TimeLiners</span>
      </td></tr>

      <!-- BODY -->
      <tr><td align="center" style="padding:32px 36px 36px;">

        <!-- Tag -->
        <div style="display:inline-block;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:4px 14px;border-radius:50px;margin-bottom:20px;background:${tagBg};color:${tagColor};font-family:'Poppins',sans-serif;">${tag}</div>

        <!-- Headline -->
        <h1 style="font-size:22px;font-weight:700;color:#1d1d1f;letter-spacing:-.4px;line-height:1.3;margin:0 0 14px;font-family:'Poppins',sans-serif;">${headline}</h1>

        ${body}

      </td></tr>

      <!-- FOOTER -->
      <tr><td align="center" style="padding:16px 36px 28px;border-top:1px solid #f0f0f0;">
        <p style="font-size:11px;color:#bbb;line-height:1.8;margin:0;font-family:'Poppins',sans-serif;">
          Made in Sri Lanka &nbsp;·&nbsp; <a href="${SITE}" style="color:#FE730A;text-decoration:none;">timeliners.lk</a><br>
          Questions? <a href="${SUPPORT_WA}" style="color:#FE730A;text-decoration:none;">WhatsApp us</a> or reply to this email
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

function infoBox(rows: { label: string; value: string; valueColor?: string }[]) {
  return `
  <table width="300" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:300px;background:#f5f6f8;border-radius:12px;margin:20px auto;">
    ${rows.map((r, i) => `
    <tr>
      <td style="padding:10px 20px;font-size:13px;color:#999;font-family:'Poppins',sans-serif;${i < rows.length - 1 ? 'border-bottom:1px solid rgba(0,0,0,.06);' : ''}">${r.label}</td>
      <td style="padding:10px 20px;font-size:13px;font-weight:600;color:${r.valueColor || '#1d1d1f'};text-align:right;font-family:'Poppins',sans-serif;${i < rows.length - 1 ? 'border-bottom:1px solid rgba(0,0,0,.06);' : ''}">${r.value}</td>
    </tr>`).join('')}
  </table>`;
}

function featureList(items: string[], active = true) {
  const dot = active
    ? `<td width="12" style="padding:4px 8px 4px 0;vertical-align:middle;"><div style="width:6px;height:6px;border-radius:50%;background:#FE730A;display:inline-block;"></div></td>`
    : `<td width="12" style="padding:4px 8px 4px 0;vertical-align:middle;"><div style="width:6px;height:6px;border-radius:50%;background:#ddd;display:inline-block;"></div></td>`;
  const color = active ? '#555' : '#aaa';

  const half = Math.ceil(items.length / 2);
  const col1 = items.slice(0, half);
  const col2 = items.slice(half);

  return `
  <table width="300" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:300px;margin:16px auto;">
    <tr>
      <td width="50%" valign="top">
        <table cellpadding="0" cellspacing="0" border="0">
          ${col1.map(f => `<tr>${dot}<td style="font-size:13px;color:${color};padding:4px 0;font-family:'Poppins',sans-serif;">${f}</td></tr>`).join('')}
        </table>
      </td>
      <td width="50%" valign="top">
        <table cellpadding="0" cellspacing="0" border="0">
          ${col2.map(f => `<tr>${dot}<td style="font-size:13px;color:${color};padding:4px 0;font-family:'Poppins',sans-serif;">${f}</td></tr>`).join('')}
        </table>
      </td>
    </tr>
  </table>`;
}

function ctaBtn(text: string, href: string) {
  return `<table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:24px auto 8px;">
    <tr><td align="center" bgcolor="#FE730A" style="border-radius:50px;">
      <a href="${href}" style="display:inline-block;background:#FE730A;color:#ffffff;font-size:14px;font-weight:700;padding:13px 32px;border-radius:50px;text-decoration:none;font-family:'Poppins',sans-serif;">${text}</a>
    </td></tr>
  </table>`;
}

function note(text: string) {
  return `<p style="font-size:11px;color:#bbb;line-height:1.8;margin:8px 0 0;font-family:'Poppins',sans-serif;">${text}</p>`;
}

function txt(text: string) {
  return `<p style="font-size:14px;color:#666;line-height:1.75;margin:0 0 12px;font-family:'Poppins',sans-serif;">${text}</p>`;
}

// ── TEMPLATES ─────────────────────────────────────────────────────────────────

function tplProConfirmed({ name, plan, expires }: { name: string; plan: string; expires: string }) {
  const exp = new Date(expires).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return {
    subject: `Your Pro plan is now active — TimeLiners`,
    html: shell("Pro Activated", "#16a34a", "rgba(22,163,74,.1)", `You're now on Pro, ${name}.`,
      txt(`Your payment has been verified. Your <strong style="color:#1d1d1f;">${plan}</strong> plan is active and your portfolio is fully unlocked.`) +
      infoBox([
        { label: "Plan", value: plan },
        { label: "Status", value: "Active", valueColor: "#16a34a" },
        { label: "Renew before", value: exp },
      ]) +
      featureList(["Unlimited projects", "5 GB storage", "Priority in search", "Verified badge", "Analytics & stats", "Social links", "Hire Me button"]) +
      ctaBtn("View My Portfolio", SITE) +
      note(`To renew when your plan expires, visit <a href="${PAYMENT_URL}" style="color:#FE730A;text-decoration:none;">the payment page</a>.`)
    ),
  };
}

function tplPaymentRejected({ name, reason }: { name: string; reason: string }) {
  return {
    subject: `Action required: Payment slip issue — TimeLiners`,
    html: shell("Payment Issue", "#dc2626", "rgba(220,38,38,.08)", `We couldn't verify your slip, ${name}.`,
      txt("We reviewed your payment slip but were unable to confirm it.") +
      infoBox([{ label: "Reason", value: reason, valueColor: "#dc2626" }]) +
      txt("Please upload a clear photo or screenshot of your bank transfer confirmation.") +
      ctaBtn("Resubmit Payment Slip", PAYMENT_URL) +
      note(`Need help? <a href="${SUPPORT_WA}" style="color:#FE730A;text-decoration:none;">Contact us on WhatsApp</a>.`)
    ),
  };
}

function tplExpiring3Day({ name, plan, expires }: { name: string; plan: string; expires: string }) {
  const exp = new Date(expires).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return {
    subject: `Your Pro plan expires in 3 days — TimeLiners`,
    html: shell("Expiring Soon", "#FE730A", "rgba(254,115,10,.1)", `Your plan expires on ${exp}.`,
      txt(`Hi ${name}, your <strong style="color:#1d1d1f;">${plan}</strong> expires in 3 days. Renew now to keep your Pro features active without interruption.`) +
      infoBox([
        { label: "Plan", value: plan },
        { label: "Expires", value: exp, valueColor: "#FE730A" },
        { label: "Grace period", value: "7 days after expiry" },
      ]) +
      ctaBtn("Renew Pro Plan", PAYMENT_URL) +
      note("Transfer to Sampath Bank · 1085 5522 6551 · R M C P Rathnayake<br>then upload your slip at the link above.")
    ),
  };
}

function tplExpired({ name, plan, expires }: { name: string; plan: string; expires: string }) {
  const exp = new Date(expires).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return {
    subject: `Your TimeLiners Pro plan has expired`,
    html: shell("Plan Expired", "#FE730A", "rgba(254,115,10,.1)", `Your plan expired on ${exp}.`,
      txt(`Hi ${name}, your <strong style="color:#1d1d1f;">${plan}</strong> has expired. You have a <strong style="color:#1d1d1f;">7-day grace period</strong> before your account is moved to the Free plan.`) +
      infoBox([
        { label: "Status", value: "Expired", valueColor: "#FE730A" },
        { label: "Downgrade in", value: "7 days" },
      ]) +
      txt("Renew now to keep your verified badge, analytics, social links, and search priority.") +
      ctaBtn("Renew Before Downgrade", PAYMENT_URL) +
      note(`<a href="${SUPPORT_WA}" style="color:#FE730A;text-decoration:none;">Contact us on WhatsApp</a> if you need help.`)
    ),
  };
}

function tplDowngraded({ name, plan }: { name: string; plan: string }) {
  return {
    subject: `Your TimeLiners account has been moved to Free`,
    html: shell("Downgraded to Free", "#dc2626", "rgba(220,38,38,.08)", `Your account is now on the Free plan.`,
      txt(`Hi ${name}, your <strong style="color:#1d1d1f;">${plan}</strong> was not renewed so your account has been moved to Free. Your profile and projects are still safe.`) +
      featureList(["Priority search", "Verified badge", "Analytics", "Social links", "Hire Me button", "Unlimited projects"], false) +
      ctaBtn("Reactivate Pro", PAYMENT_URL) +
      note("Transfer to Sampath Bank · 1085 5522 6551 · R M C P Rathnayake<br>and upload your slip to reactivate instantly.")
    ),
  };
}

// ── SEND ──────────────────────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) throw new Error(`Resend error: ${await res.text()}`);
  return res.json();
}

// ── HANDLER ───────────────────────────────────────────────────────────────────
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
