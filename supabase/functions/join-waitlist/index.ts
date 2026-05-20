import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Inline HTML mirror of emails/WaitlistConfirmation.tsx */
function getConfirmationEmailHtml(_email: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You are on the list, sister.</title>
</head>
<body style="margin:0;padding:0;background-color:#FAFAF8;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0;padding:0;background-color:#FAFAF8;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;border-collapse:collapse;">
          <tr>
            <td align="center" style="padding-bottom:12px;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:500;color:#D4847A;letter-spacing:0.02em;">The Way | P31</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:32px;">
              <div style="height:1px;background-color:#D4847A;line-height:1px;font-size:1px;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:12px;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-style:italic;line-height:1.45;color:#1C1C1A;text-align:center;">She opens her arms to the poor and extends her hands to the needy.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#6B9E8F;">PROVERBS 31:20</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:28px;">
              <div style="height:1px;background-color:#E2DDD6;line-height:1px;font-size:1px;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:28px;">
              <p style="margin:0 0 20px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.8;color:#1C1C1A;">Sister,</p>
              <p style="margin:0 0 20px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.8;color:#1C1C1A;">You are on the list.</p>
              <p style="margin:0 0 20px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.8;color:#1C1C1A;">The doors to The Way are not open yet, but when they are, you will be the first inside. Founding Sisters receive lifetime recognition inside the community.</p>
              <p style="margin:0 0 20px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.8;color:#1C1C1A;">While you wait, we will email you from time to time with updates and encouragement.</p>
              <p style="margin:0 0 20px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.8;color:#1C1C1A;">The journey begins soon.</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.8;color:#1C1C1A;">With love,<br />The Way</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;">
              <div style="height:1px;background-color:#E2DDD6;line-height:1px;font-size:1px;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:36px;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-style:italic;line-height:1.6;color:#7A7A72;text-align:center;">Know a woman who needs this community? Forward this email to her.</p>
            </td>
          </tr>
          <tr>
            <td align="center">
              <p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#7A7A72;text-align:center;">Proverbs31Way.com, Christian App Empire LLC</p>
              <p style="margin:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#7A7A72;text-align:center;">You received this because you joined our waitlist.</p>
              <p style="margin:0;text-align:center;">
                <a href="https://proverbs31way.com/unsubscribe" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6B9E8F;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function waitlistRowCount(
  supabase: ReturnType<typeof createClient>,
): Promise<number> {
  const { count, error } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });
  if (error) {
    console.error("waitlist count error:", error);
    return 0;
  }
  return count ?? 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  /** Public count for marketing UI (service role; anon cannot rely on RLS SELECT). */
  if (req.method === "GET") {
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!supabaseUrl || !serviceRoleKey) {
        return new Response(
          JSON.stringify({ error: "Server configuration error" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const count = await waitlistRowCount(supabase);
      return new Response(JSON.stringify({ count }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("join-waitlist GET error:", err);
      return new Response(
        JSON.stringify({ error: "Something went wrong." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error: insertError } = await supabase
      .from("waitlist")
      .insert({ email });

    if (insertError && insertError.code !== "23505") {
      console.error("Waitlist insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Could not add you to the waitlist. Please try again." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "The Way <hello@proverbs31way.com>",
          to: [email],
          subject: "You are on the list, sister.",
          html: getConfirmationEmailHtml(email),
        }),
      });

      if (!resendRes.ok) {
        console.error("Resend error:", await resendRes.text());
      }
    } else {
      console.warn("RESEND_API_KEY not set; skipping confirmation email");
    }

    const count = await waitlistRowCount(supabase);
    return new Response(JSON.stringify({ success: true, count }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("join-waitlist error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
