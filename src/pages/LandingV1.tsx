/**
 * The Way: waitlist marketing landing. Direction 02 visual language.
 * Conversion funnel aligned with the Sunday Journal product direction.
 */

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";
import { supabaseBrowser, fetchWaitlistCount } from "@/lib/supabaseBrowser";
import "@/styles/landing-d2.css";

const FOUNDING_SPOTS_TOTAL = 500;

const HERO_SLIDES = [
  { src: "/images/v1-hero.jpg", alt: "Woman in warm natural light" },
  {
    src: "/images/hero-carousel-01.jpg",
    alt: "Woman raising her arms toward the sky in a sunlit field",
  },
  {
    src: "/images/hero-carousel-02.jpg",
    alt: "Woman standing alone on white sand dunes under a wide sky",
  },
  {
    src: "/images/hero-carousel-03.jpg",
    alt: "Woman reading Scripture outdoors on a rock in soft light",
  },
  {
    src: "/images/hero-carousel-04.jpg",
    alt: "Woman in quiet prayer outdoors with eyes closed",
  },
  {
    src: "/images/hero-carousel-05.jpg",
    alt: "Woman in a sunlit alley looking upward in thought",
  },
  {
    src: "/images/hero-carousel-06.jpg",
    alt: "Hands resting on a leather-bound Bible",
  },
  {
    src: "/images/hero-carousel-07.jpg",
    alt: "Woman in a wildflower field holding flowers toward the sky",
  },
  {
    src: "/images/hero-carousel-08.jpg",
    alt: "Woman meditating by a still lake in the forest",
  },
  {
    src: "/images/hero-carousel-09.jpg",
    alt: "Woman reading an open Bible outdoors",
  },
  {
    src: "/images/hero-carousel-10.jpg",
    alt: "Woman with a Bible resting quietly outdoors",
  },
  {
    src: "/images/hero-carousel-11.jpg",
    alt: "Woman praying before a mountain landscape",
  },
] as const;

const HERO_ROTATE_MS = 6500;

const journalBeats = [
  {
    num: "01",
    name: "The Word",
    desc: "We start with Scripture. Same passage for everyone, with room to sit with it.",
  },
  {
    num: "02",
    name: "Today's Devotional",
    desc: "A short reading and one question you can take into the rest of your day.",
  },
  {
    num: "03",
    name: "The Gathering",
    desc: "Share what stirred you, or ask for prayer. Other women can respond with care.",
  },
];

const foundingBenefits = [
  "You'll be known as a Founding Sister",
  "Your first year is free",
  "Help shape The Way while it's still being built",
  "You're among the first through the door when we open",
  "Your name is written into our opening prayer",
];

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="ld2-eyebrow">{children}</p>;
}

function ScrollFade({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`opacity-0 translate-y-6 animate-[fadeInUp_0.8s_ease-out_forwards] ${className}`}
    >
      {children}
    </div>
  );
}

type WaitlistStatus = "idle" | "loading" | "success" | "error";

function waitlistErrorMessage(error: { message?: string } | null): string {
  const raw = (error?.message || "").toLowerCase();
  if (
    raw.includes("failed to fetch") ||
    raw.includes("network") ||
    raw.includes("fetch") ||
    raw.includes("dns") ||
    raw.includes("load failed")
  ) {
    return "We couldn't reach the waitlist just now. Please try again in a moment.";
  }
  if (raw.includes("non-2xx") || raw.includes("edge function")) {
    return "The waitlist service is temporarily unavailable. Please try again shortly.";
  }
  return error?.message || "Something went wrong. Please try again.";
}

export default function LandingV1() {
  const [email, setEmail] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState<WaitlistStatus>("idle");
  const [waitlistError, setWaitlistError] = useState("");
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  const refreshWaitlistCount = useCallback(async () => {
    const n = await fetchWaitlistCount();
    if (n !== null) setWaitlistCount(n);
  }, []);

  useEffect(() => {
    void refreshWaitlistCount();

    const channel = supabaseBrowser
      .channel("waitlist-landing-count")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "waitlist" },
        () => {
          void refreshWaitlistCount();
        },
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [refreshWaitlistCount]);

  useEffect(() => {
    if (HERO_SLIDES.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, HERO_ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || waitlistStatus === "loading") return;

    setWaitlistStatus("loading");
    setWaitlistError("");

    try {
      const { data, error } = await supabaseBrowser.functions.invoke(
        "join-waitlist",
        { body: { email: trimmed } },
      );

      if (error) {
        setWaitlistStatus("error");
        setWaitlistError(waitlistErrorMessage(error));
        return;
      }

      const payload = data as
        | { success?: boolean; error?: string; count?: number }
        | null;
      if (payload?.error) {
        setWaitlistStatus("error");
        setWaitlistError(payload.error);
        return;
      }

      if (!payload?.success) {
        setWaitlistStatus("error");
        setWaitlistError("Something went wrong. Please try again.");
        return;
      }

      setWaitlistStatus("success");
      if (typeof payload?.count === "number") setWaitlistCount(payload.count);
      void refreshWaitlistCount();
    } catch (err) {
      setWaitlistStatus("error");
      setWaitlistError(
        waitlistErrorMessage(
          err instanceof Error ? err : { message: String(err) },
        ),
      );
    }
  };

  return (
    <div className="landing-d2 min-h-[100dvh]">
      <style>{`
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-delay-1 { animation-delay: 0.15s; }
        .animate-delay-2 { animation-delay: 0.30s; }
        .animate-delay-3 { animation-delay: 0.45s; }
        .animate-delay-4 { animation-delay: 0.60s; }
        .animate-delay-5 { animation-delay: 0.75s; }
      `}</style>

      {/* Hero */}
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
        <div className="ld2-hero-carousel" aria-hidden={false}>
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.src}
              className={`ld2-hero-slide${index === heroIndex ? " is-active" : ""}`}
              aria-hidden={index !== heroIndex}
            >
              <img
                src={slide.src}
                alt={index === heroIndex ? slide.alt : ""}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
          ))}
          <div className="ld2-hero-veil" aria-hidden />
          {HERO_SLIDES.length > 1 ? (
            <div
              className="ld2-hero-dots"
              role="tablist"
              aria-label="Hero images"
            >
              {HERO_SLIDES.map((slide, index) => (
                <button
                  key={slide.src}
                  type="button"
                  role="tab"
                  aria-selected={index === heroIndex}
                  aria-label={`Show image ${index + 1}`}
                  className={`ld2-hero-dot${index === heroIndex ? " is-active" : ""}`}
                  onClick={() => setHeroIndex(index)}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative z-10 w-full px-6 md:px-10 lg:px-[8vw] py-20">
          <div className="max-w-2xl">
            <ScrollFade>
              <p className="ld2-hero-tagline">
                A HOME FOR THE DAUGHTERS OF GOD
              </p>
            </ScrollFade>

            <ScrollFade className="animate-delay-1">
              <h1 className="ld2-display text-[44px] md:text-[58px] lg:text-[68px] leading-[1.05] mb-6">
                You weren't meant
                <br />
                to walk this alone.
              </h1>
            </ScrollFade>

            <ScrollFade className="animate-delay-2">
              <p className="ld2-body text-lg md:text-xl max-w-lg mb-8">
                A little Scripture each day, room to sit with it, and sisters
                who will walk with you. Not another checklist. A place to
                belong.
              </p>
            </ScrollFade>

            <ScrollFade className="animate-delay-3">
              <div className="ld2-hero-cta mb-10">
                <button
                  type="button"
                  className="ld2-hero-cta-primary"
                  onClick={() => scrollToSection("waitlist")}
                >
                  <span>Join the Waitlist</span>
                  <span className="ld2-hero-cta-arrow" aria-hidden="true">
                    ↗
                  </span>
                </button>
                <Link
                  to={{ pathname: "/today", search: "?auth=signin" }}
                  className="ld2-hero-cta-secondary"
                >
                  Sign in
                </Link>
              </div>
            </ScrollFade>

            <ScrollFade className="animate-delay-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    "/images/hero-carousel-04.jpg",
                    "/images/hero-carousel-03.jpg",
                    "/images/hero-carousel-08.jpg",
                    "/images/hero-carousel-01.jpg",
                  ].map((src) => (
                    <div
                      key={src}
                      className="w-8 h-8 rounded-full overflow-hidden border border-[var(--line)]"
                      style={{ background: "var(--panel)" }}
                    >
                      <img src={src} alt="" className="ld2-img h-full" />
                    </div>
                  ))}
                </div>
                <p className="ld2-body text-sm" style={{ color: "var(--ink)" }}>
                  <span className="font-bold tabular-nums">
                    {waitlistCount === null
                      ? "…"
                      : waitlistCount.toLocaleString()}
                  </span>{" "}
                  <span style={{ color: "var(--muted)" }}>
                    sisters already waiting
                  </span>
                </p>
              </div>
            </ScrollFade>
          </div>
        </div>

        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce"
          style={{ color: "var(--muted)", opacity: 0.45 }}
        >
          <ArrowDownIcon />
        </div>
      </section>

      {/* Why we built this */}
      <section className="py-20 md:py-28 px-6 md:px-10 lg:px-[8vw]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <ScrollFade>
              <SectionEyebrow>WHY WE BUILT THIS</SectionEyebrow>
            </ScrollFade>
            <ScrollFade className="animate-delay-1">
              <h2 className="ld2-display text-[32px] md:text-[42px] leading-[1.12] mb-6">
                Some days faith feels lonely, even when you love the Lord.
              </h2>
            </ScrollFade>
            <ScrollFade className="animate-delay-2">
              <div className="space-y-4">
                {[
                  "You open your Bible before anyone else is awake.",
                  "You have questions you don't quite feel safe asking out loud.",
                  "You want something deeper than a quick comment thread.",
                  "And you wonder if other women feel that same quiet ache.",
                ].map((text) => (
                  <p
                    key={text}
                    className="ld2-body text-base pl-4"
                    style={{ borderLeft: "2px solid rgba(117,71,91,0.35)" }}
                  >
                    {text}
                  </p>
                ))}
              </div>
            </ScrollFade>
          </div>
          <ScrollFade className="animate-delay-2">
            <div className="relative">
              <img
                src="/images/v1-why-built.jpg"
                alt="Woman reading Scripture outdoors on a rock in a sunlit meadow"
                className="ld2-img h-[420px] md:h-[520px]"
              />
              <div
                className="absolute -bottom-5 -left-5 max-w-[240px] p-5"
                style={{ background: "var(--panel)" }}
              >
                <p
                  className="ld2-display italic text-[26px] leading-[1.35]"
                  style={{ color: "var(--ink)" }}
                >
                  Carry each other&apos;s burdens, and in this way you will
                  fulfill the law of Christ.
                </p>
                <div className="ld2-rule mx-0" />
                <p className="ld2-eyebrow mb-0">GALATIANS 6:2</p>
              </div>
            </div>
          </ScrollFade>
        </div>
      </section>

      {/* What is The Way */}
      <section className="py-20 md:py-28 ld2-surface">
        <div className="px-6 md:px-10 lg:px-[8vw] max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <ScrollFade>
              <img
                src="/images/v1-community.jpg"
                alt="Women in community"
                className="ld2-img h-[400px] md:h-[500px] order-2 md:order-1"
              />
            </ScrollFade>
            <div className="order-1 md:order-2">
              <ScrollFade className="animate-delay-1">
                <SectionEyebrow>WHAT IS THE WAY</SectionEyebrow>
              </ScrollFade>
              <ScrollFade className="animate-delay-2">
                <h2 className="ld2-display text-[32px] md:text-[42px] leading-[1.12] mb-6">
                  A simple daily rhythm for women who want to grow together.
                </h2>
              </ScrollFade>
              <ScrollFade className="animate-delay-3">
                <div className="space-y-5">
                  {[
                    {
                      title: "Scripture you can sit with.",
                      desc: "Not something to skim and forget. A word for the day that has room to land.",
                    },
                    {
                      title: "A short reading, then one question.",
                      desc: "Something gentle enough for a quiet morning, and honest enough for a hard one.",
                    },
                    {
                      title: "A place to share out loud.",
                      desc: "Write what stirred you, or ask for prayer. Other sisters can answer with kindness.",
                    },
                  ].map((item) => (
                    <div key={item.title}>
                      <p
                        className="font-bold text-base"
                        style={{
                          fontFamily: "var(--sans)",
                          color: "var(--ink)",
                        }}
                      >
                        {item.title}
                      </p>
                      <p className="ld2-body text-sm mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </ScrollFade>
            </div>
          </div>
        </div>
      </section>

      {/* Scripture */}
      <section
        className="w-full py-24 px-6"
        style={{ backgroundColor: "var(--white)" }}
      >
        <div className="max-w-[720px] mx-auto text-center">
          <p className="ld2-eyebrow" style={{ color: "var(--rose)" }}>
            WHAT THE WORD SAYS ABOUT COMMUNITY
          </p>

          <img
            src="/images/v1-community-ecclesiastes.jpg"
            alt="Three women sitting closely together on a wooden bench in a tulip field, showing support and community."
            className="ld2-img mb-10 max-h-[280px] sm:max-h-[340px] md:max-h-[400px]"
            width={1024}
            height={682}
            loading="lazy"
            decoding="async"
          />

          <p className="ld2-display italic text-[24px] md:text-[32px] leading-[1.55]">
            Two are better than one, because they have a good return for their
            labor: If either of them falls down, one can help the other up.
          </p>

          <div className="ld2-rule" aria-hidden />

          <p className="ld2-eyebrow mb-0">ECCLESIASTES 4:9-10</p>
        </div>
      </section>

      {/* Inside today's reading */}
      <section id="inside" className="py-20 md:py-28 ld2-surface">
        <div className="px-6 md:px-10 lg:px-[8vw]">
          <ScrollFade>
            <div className="text-center mb-14">
              <SectionEyebrow>INSIDE TODAY&apos;S READING</SectionEyebrow>
              <h2 className="ld2-display text-[32px] md:text-[42px] leading-[1.12]">
                Here&apos;s what a day looks like.
              </h2>
            </div>
          </ScrollFade>

          <div className="max-w-3xl mx-auto">
            {journalBeats.map((beat, i) => (
              <ScrollFade
                key={beat.num}
                className={`animate-delay-${Math.min(i + 1, 5)}`}
              >
                <div className="ld2-beat">
                  <span className="ld2-beat-num">{beat.num}</span>
                  <div>
                    <h3 className="ld2-display text-2xl md:text-[28px] m-0 mb-2">
                      {beat.name}
                    </h3>
                    <p className="ld2-body text-sm m-0">{beat.desc}</p>
                  </div>
                </div>
              </ScrollFade>
            ))}
          </div>
        </div>
      </section>

      {/* Founding Sisters */}
      <section className="py-20 md:py-28 px-6 md:px-10 lg:px-[8vw]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <ScrollFade>
              <SectionEyebrow>FOUNDING SISTERS</SectionEyebrow>
            </ScrollFade>
            <ScrollFade className="animate-delay-1">
              <h2 className="ld2-display text-[32px] md:text-[42px] leading-[1.12] mb-6">
                Become a Founding Sister.
              </h2>
            </ScrollFade>
            <ScrollFade className="animate-delay-2">
              <p className="ld2-body text-base mb-8">
                The first 500 women who join become Founding Sisters. You help
                shape this from the beginning, and you&apos;ll be remembered for
                it. Joining the waitlist is free. When the doors open, you get
                first access.
              </p>
            </ScrollFade>
            <ScrollFade className="animate-delay-3">
              <ul className="space-y-3 mb-8 list-none p-0 m-0">
                {foundingBenefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-3 text-sm"
                    style={{
                      fontFamily: "var(--sans)",
                      color: "var(--ink)",
                    }}
                  >
                    <span
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: "var(--rose)" }}
                    >
                      <CheckIcon />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </ScrollFade>
            <ScrollFade className="animate-delay-4">
              <div
                className="inline-flex items-center gap-2 px-4 py-2"
                style={{ background: "var(--panel)" }}
              >
                <span
                  className="relative flex h-2.5 w-2.5"
                  style={{ background: "var(--rose)", borderRadius: "50%" }}
                />
                <span
                  className="text-sm tabular-nums"
                  style={{ fontFamily: "var(--sans)", color: "var(--ink)" }}
                >
                  <span className="font-bold">
                    {waitlistCount === null
                      ? "…"
                      : waitlistCount.toLocaleString()}
                  </span>{" "}
                  of {FOUNDING_SPOTS_TOTAL.toLocaleString()} spots claimed
                </span>
              </div>
            </ScrollFade>
          </div>
          <ScrollFade className="animate-delay-2">
            <img
              src="/images/v1-founding-sister.jpg"
              alt="Smiling woman in a white shirt on a couch with camera and laptop, warm creative workspace"
              className="ld2-img h-[420px] md:h-[520px]"
            />
          </ScrollFade>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section id="waitlist" className="py-24 md:py-32 ld2-panel">
        <div className="px-6 md:px-10 lg:px-[8vw] max-w-2xl mx-auto text-center">
          <ScrollFade>
            <SectionEyebrow>THE DOORS OPEN SOON</SectionEyebrow>
          </ScrollFade>
          <ScrollFade className="animate-delay-1">
            <h2 className="ld2-display text-[36px] md:text-[48px] lg:text-[56px] leading-[1.08] mb-5">
              Your sisters are waiting.
            </h2>
          </ScrollFade>
            <ScrollFade className="animate-delay-2">
            <p className="ld2-body text-lg mb-10 max-w-md mx-auto">
              Leave your email and save your spot as one of the first 500
              Founding Sisters.
            </p>
          </ScrollFade>

          <ScrollFade className="animate-delay-3">
            {waitlistStatus === "success" ? (
              <p className="ld2-display italic text-xl md:text-2xl leading-relaxed max-w-md mx-auto">
                You are on the list, sister. We will see you soon.
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row items-stretch sm:items-end justify-center gap-4 max-w-md mx-auto"
              >
                <label className="sr-only" htmlFor="waitlist-email">
                  Email address
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={waitlistStatus === "loading"}
                  autoComplete="email"
                  className="ld2-input sm:flex-1"
                />
                <button
                  type="submit"
                  disabled={waitlistStatus === "loading"}
                  className="ld2-btn whitespace-nowrap"
                >
                  {waitlistStatus === "loading"
                    ? "Joining..."
                    : "Join the Waitlist"}
                </button>
              </form>
            )}
            {waitlistStatus === "error" && waitlistError ? (
              <p
                className="mt-4 max-w-md mx-auto text-sm"
                style={{ color: "var(--muted)", fontFamily: "var(--sans)" }}
                role="alert"
              >
                {waitlistError}
              </p>
            ) : null}
          </ScrollFade>

          <ScrollFade className="animate-delay-4">
            <p
              className="ld2-display italic text-sm mt-8"
              style={{ color: "var(--muted)" }}
            >
              &ldquo;She perceives that her merchandise is profitable.&rdquo;
              Proverbs 31:18
            </p>
          </ScrollFade>
        </div>
      </section>

      {/* Footer */}
      <footer className="ld2-footer">
        <div className="px-6 md:px-10 lg:px-[8vw] py-14 md:py-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <Link
                to="/"
                className="ld2-display text-[42px] leading-none no-underline"
                style={{ color: "#f7f3f6", textDecoration: "none" }}
              >
                the <em>way.</em>
              </Link>
              <p
                className="mt-3 text-[10px] font-bold tracking-[0.18em] uppercase"
                style={{ color: "#f2dfe7", fontFamily: "var(--sans)" }}
              >
                Scripture, reflection, and sisters beside you.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href="https://christianappempire.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                About
              </a>
              <button type="button" onClick={() => scrollToSection("inside")}>
                Inside
              </button>
              <button type="button" onClick={() => scrollToSection("waitlist")}>
                Join
              </button>
              <Link to={{ pathname: "/today", search: "?auth=signin" }}>
                Sign in
              </Link>
              <a href="mailto:christianappempire@gmail.com">Contact</a>
            </div>
          </div>
          <div
            className="mt-10 pt-6 flex flex-col md:flex-row justify-between gap-3 text-[10px] tracking-[0.16em] uppercase"
            style={{
              borderTop: "1px solid #615861",
              color: "#c5bfc5",
              fontFamily: "var(--sans)",
            }}
          >
            <span>&copy; 2026 Christian App Empire LLC</span>
            <span>No private messaging</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
