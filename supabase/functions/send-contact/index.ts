const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_TO = "hello@proverbs31way.com";
const CONTACT_BCC = "ChristianAppEmpire@gmail.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 4000) : "";

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Please enter a valid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (message.length < 10) {
      return new Response(JSON.stringify({ error: "Please write a bit more in your message." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not set");
      return new Response(
        JSON.stringify({ error: "Contact form is not available. Please try again later." }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const safeName = name || "(no name)";
    const html = `<!DOCTYPE html><html><body style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#1C1C1A;">
<p><strong>New message</strong> from Proverbs31Way.com contact form.</p>
<p><strong>Name:</strong> ${escapeHtml(safeName)}<br/>
<strong>Email:</strong> ${escapeHtml(email)}</p>
<p style="white-space:pre-wrap;border-left:3px solid #D4847A;padding-left:12px;margin:16px 0;">${escapeHtml(message)}</p>
<p style="font-size:12px;color:#7A7A72;">Reply directly to this email to reach the sender (Reply-To is set).</p>
</body></html>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "The Way <hello@proverbs31way.com>",
        to: [CONTACT_TO],
        bcc: [CONTACT_BCC],
        reply_to: email,
        subject: `[Proverbs31Way] Contact: ${safeName !== "(no name)" ? safeName : email}`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend contact error:", errText);
      return new Response(
        JSON.stringify({ error: "Could not send your message. Please try again." }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-contact error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
