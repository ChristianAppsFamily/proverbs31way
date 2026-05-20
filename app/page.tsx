"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const colors = {
  base: "#FAFAF8",
  rose: "#D4847A",
  sage: "#6B9E8F",
  text: "#1C1C1A",
  surface: "#F2F0EB",
  border: "#E2DDD6",
  muted: "#6B6B68",
} as const;

const mutedItalic = "#7A7A72";

type WaitlistStatus = "idle" | "loading" | "success" | "error";

function WaitlistCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<WaitlistStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || status === "loading") return;

    setStatus("loading");
    setErrorMessage("");

    const { data, error } = await supabase.functions.invoke("join-waitlist", {
      body: { email: trimmed },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message || "Something went wrong. Please try again.");
      return;
    }

    const payload = data as { success?: boolean; error?: string } | null;
    if (payload?.error) {
      setStatus("error");
      setErrorMessage(payload.error);
      return;
    }

    if (!payload?.success) {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
      return;
    }

    setStatus("success");
  };

  if (status === "success") {
    return (
      <p
        className="text-xl md:text-2xl leading-relaxed"
        style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontStyle: "italic",
          color: colors.text,
        }}
      >
        You are on the list, sister. We will see you soon.
      </p>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === "loading"}
          autoComplete="email"
          className="w-full flex-1 px-6 py-4 text-base outline-none transition-all disabled:opacity-60"
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            color: colors.text,
            backgroundColor: colors.base,
            border: `1px solid ${colors.border}`,
            borderRadius: "9999px",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.rose;
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212, 132, 122, 0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full sm:w-auto px-8 py-4 text-base font-medium whitespace-nowrap transition-opacity disabled:cursor-not-allowed"
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            color: "#FFFFFF",
            backgroundColor: colors.rose,
            borderRadius: "9999px",
            opacity: status === "loading" ? 0.75 : 1,
          }}
        >
          {status === "loading" ? "Joining..." : "Notify Me"}
        </button>
      </form>

      {status === "error" && errorMessage ? (
        <p
          className="mt-4 text-sm"
          role="alert"
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            color: colors.muted,
          }}
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function WaitlistCounterSection({ count }: { count: number | null }) {
  const nameLine =
    count === 1
      ? "woman has already added her name."
      : "women have already added their name.";

  return (
    <section className="w-full py-24 px-6" style={{ backgroundColor: colors.base }}>
      <div className="max-w-[480px] mx-auto text-center">
        <p
          className="mb-6"
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: colors.sage,
          }}
        >
          FROM THE WAITING ROOM
        </p>

        {count === 0 ? (
          <p
            className="text-[56px] md:text-[72px] leading-none mb-6"
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontStyle: "italic",
              fontWeight: 300,
              color: colors.text,
            }}
          >
            Be the first to join
          </p>
        ) : (
          <p
            className="text-[56px] md:text-[72px] leading-none mb-6 tabular-nums"
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontWeight: 300,
              color: colors.text,
            }}
          >
            {count === null ? "—" : count.toLocaleString()}
          </p>
        )}

        <p
          className="mb-4"
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: "18px",
            color: colors.text,
          }}
        >
          {nameLine}
        </p>

        <p
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: "15px",
            fontStyle: "italic",
            color: mutedItalic,
          }}
        >
          They are waiting for the same thing you are.
        </p>
      </div>
    </section>
  );
}

function ScriptureAnchorSection() {
  return (
    <section className="w-full py-24 px-6" style={{ backgroundColor: colors.surface }}>
      <div className="max-w-[560px] mx-auto text-center">
        <p
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: colors.sage,
            marginBottom: "32px",
          }}
        >
          WHAT THE WORD SAYS ABOUT COMMUNITY
        </p>

        <p
          className="text-[24px] md:text-[32px] leading-[1.6]"
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontStyle: "italic",
            color: colors.text,
          }}
        >
          Two are better than one, because they have a good return for their labor: If either of them
          falls down, one can help the other up.
        </p>

        <div
          className="mx-auto"
          style={{
            width: "48px",
            height: "1px",
            backgroundColor: colors.rose,
            marginTop: "24px",
            marginBottom: "24px",
          }}
          aria-hidden
        />

        <p
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: "13px",
            fontWeight: 500,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: colors.sage,
          }}
        >
          ECCLESIASTES 4:9–10
        </p>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from("waitlist")
        .select("*", { count: "exact", head: true });
      setCount(count);
    };

    fetchCount();

    const channel = supabase
      .channel("waitlist-count")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "waitlist" },
        () => {
          fetchCount();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-[100dvh] flex flex-col w-full">
      <section
        id="waitlist"
        className="flex flex-1 items-center justify-center px-6 py-24 w-full"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="w-full max-w-2xl text-center">
          <p
            className="text-[11px] font-medium tracking-[0.14em] uppercase mb-4"
            style={{
              fontFamily: '"DM Sans", system-ui, sans-serif',
              color: colors.sage,
            }}
          >
            The doors open soon
          </p>
          <h1
            className="text-4xl md:text-5xl font-medium leading-tight mb-5"
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              color: colors.text,
            }}
          >
            Your sisters are waiting.
          </h1>
          <p
            className="text-lg mb-10 max-w-md mx-auto"
            style={{
              fontFamily: '"DM Sans", system-ui, sans-serif',
              color: colors.muted,
            }}
          >
            Enter your email to join the waitlist and be among the first Founding Sisters.
          </p>
          <WaitlistCapture />
        </div>
      </section>
      <WaitlistCounterSection count={count} />
      <ScriptureAnchorSection />
    </main>
  );
}
