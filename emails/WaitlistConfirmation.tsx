/**
 * Waitlist confirmation email, Proverbs31Way.com
 * Inline styles only (Resend React). Warm personal letter tone.
 *
 * Edge function HTML mirror: supabase/functions/join-waitlist/index.ts
 * (getConfirmationEmailHtml)
 */

export const WAITLIST_CONFIRMATION_SUBJECT = "You are on the list, sister.";

export default function WaitlistConfirmation() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{WAITLIST_CONFIRMATION_SUBJECT}</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#FAFAF8",
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <table
          role="presentation"
          cellPadding={0}
          cellSpacing={0}
          width="100%"
          style={{
            margin: 0,
            padding: 0,
            backgroundColor: "#FAFAF8",
            borderCollapse: "collapse",
          }}
        >
          <tbody>
            <tr>
              <td align="center" style={{ padding: "40px 16px" }}>
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  width="600"
                  style={{
                    maxWidth: "600px",
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <tbody>
                    {/* Wordmark */}
                    <tr>
                      <td align="center" style={{ paddingBottom: "12px" }}>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            fontSize: "18px",
                            fontWeight: 500,
                            color: "#D4847A",
                            letterSpacing: "0.02em",
                          }}
                        >
                          The Way | P31
                        </p>
                      </td>
                    </tr>

                    {/* Dusty rose rule */}
                    <tr>
                      <td style={{ paddingBottom: "32px" }}>
                        <div
                          style={{
                            height: "1px",
                            backgroundColor: "#D4847A",
                            lineHeight: "1px",
                            fontSize: "1px",
                          }}
                        >
                          &nbsp;
                        </div>
                      </td>
                    </tr>

                    {/* Opening verse */}
                    <tr>
                      <td align="center" style={{ paddingBottom: "12px" }}>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            fontSize: "24px",
                            fontStyle: "italic",
                            lineHeight: 1.45,
                            color: "#1C1C1A",
                            textAlign: "center",
                          }}
                        >
                          She opens her arms to the poor and extends her hands to the needy.
                        </p>
                      </td>
                    </tr>

                    {/* Scripture reference */}
                    <tr>
                      <td align="center" style={{ paddingBottom: "28px" }}>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: 'Arial, Helvetica, sans-serif',
                            fontSize: "11px",
                            fontWeight: 600,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: "#6B9E8F",
                          }}
                        >
                          PROVERBS 31:20
                        </p>
                      </td>
                    </tr>

                    {/* Greige divider */}
                    <tr>
                      <td style={{ paddingBottom: "28px" }}>
                        <div
                          style={{
                            height: "1px",
                            backgroundColor: "#E2DDD6",
                            lineHeight: "1px",
                            fontSize: "1px",
                          }}
                        >
                          &nbsp;
                        </div>
                      </td>
                    </tr>

                    {/* Body copy */}
                    <tr>
                      <td style={{ paddingBottom: "28px" }}>
                        <p
                          style={{
                            margin: "0 0 20px 0",
                            fontFamily: 'Arial, Helvetica, sans-serif',
                            fontSize: "16px",
                            lineHeight: 1.8,
                            color: "#1C1C1A",
                          }}
                        >
                          Sister,
                        </p>
                        <p
                          style={{
                            margin: "0 0 20px 0",
                            fontFamily: 'Arial, Helvetica, sans-serif',
                            fontSize: "16px",
                            lineHeight: 1.8,
                            color: "#1C1C1A",
                          }}
                        >
                          You are on the list.
                        </p>
                        <p
                          style={{
                            margin: "0 0 20px 0",
                            fontFamily: 'Arial, Helvetica, sans-serif',
                            fontSize: "16px",
                            lineHeight: 1.8,
                            color: "#1C1C1A",
                          }}
                        >
                          The doors to The Way are not open yet, but when they are, you will be the first inside.
                          Founding Sisters receive lifetime recognition inside the community.
                        </p>
                        <p
                          style={{
                            margin: "0 0 20px 0",
                            fontFamily: 'Arial, Helvetica, sans-serif',
                            fontSize: "16px",
                            lineHeight: 1.8,
                            color: "#1C1C1A",
                          }}
                        >
                          While you wait, we will send you a verse each week to carry with you.
                        </p>
                        <p
                          style={{
                            margin: "0 0 20px 0",
                            fontFamily: 'Arial, Helvetica, sans-serif',
                            fontSize: "16px",
                            lineHeight: 1.8,
                            color: "#1C1C1A",
                          }}
                        >
                          The journey begins soon.
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: 'Arial, Helvetica, sans-serif',
                            fontSize: "16px",
                            lineHeight: 1.8,
                            color: "#1C1C1A",
                          }}
                        >
                          With love,
                          <br />
                          The Way
                        </p>
                      </td>
                    </tr>

                    {/* Divider below sign-off */}
                    <tr>
                      <td style={{ paddingBottom: "24px" }}>
                        <div
                          style={{
                            height: "1px",
                            backgroundColor: "#E2DDD6",
                            lineHeight: "1px",
                            fontSize: "1px",
                          }}
                        >
                          &nbsp;
                        </div>
                      </td>
                    </tr>

                    {/* Forward note */}
                    <tr>
                      <td align="center" style={{ paddingBottom: "36px" }}>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            fontSize: "14px",
                            fontStyle: "italic",
                            lineHeight: 1.6,
                            color: "#7A7A72",
                            textAlign: "center",
                          }}
                        >
                          Know a woman who needs this community? Forward this email to her.
                        </p>
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td align="center">
                        <p
                          style={{
                            margin: "0 0 8px 0",
                            fontFamily: 'Arial, Helvetica, sans-serif',
                            fontSize: "12px",
                            lineHeight: 1.6,
                            color: "#7A7A72",
                            textAlign: "center",
                          }}
                        >
                          Proverbs31Way.com · Christian App Empire LLC
                        </p>
                        <p
                          style={{
                            margin: "0 0 12px 0",
                            fontFamily: 'Arial, Helvetica, sans-serif',
                            fontSize: "12px",
                            lineHeight: 1.6,
                            color: "#7A7A72",
                            textAlign: "center",
                          }}
                        >
                          You received this because you joined our waitlist.
                        </p>
                        <p style={{ margin: 0, textAlign: "center" }}>
                          <a
                            href="https://proverbs31way.com/unsubscribe"
                            style={{
                              fontFamily: 'Arial, Helvetica, sans-serif',
                              fontSize: "12px",
                              color: "#6B9E8F",
                              textDecoration: "underline",
                            }}
                          >
                            Unsubscribe
                          </a>
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
