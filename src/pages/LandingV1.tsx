/**
 * The Way — V1 Marketing Landing Page
 * Pure conversion funnel. Every section drives toward waitlist signup.
 * No product feature demos. Only emotion, aspiration, and belonging.
 */

import { useState } from "react";
import { Link } from "react-router";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

/* ═══════════════════════════════════════════
   Data
   ═══════════════════════════════════════════ */

const testimonials = [
  {
    quote: "I have never felt less alone in my walk with God.",
    name: "Sarah M.",
    role: "Founding Sister",
    image: "/images/v1-sister.jpg",
  },
  {
    quote: "This is the community I prayed for but didn't know existed.",
    name: "Grace T.",
    role: "Beta Member",
    image: "/images/v1-prayer.jpg",
  },
  {
    quote: "Real conversation. No performance. Just sisters.",
    name: "Amara K.",
    role: "Founding Sister",
    image: "/images/v1-diverse.jpg",
  },
];

const roomsTeaser = [
  { name: "The Garden", desc: "Daily scripture to start your morning rooted." },
  { name: "The Table", desc: "Honest conversation over a shared meal." },
  { name: "The Well", desc: "Living water for the dry seasons." },
  { name: "The Letter", desc: "Write your heart. Be deeply known." },
  { name: "The Sanctuary", desc: "Stillness, prayer, and sacred rest." },
];

const foundingBenefits = [
  "Lifetime Founding Sister badge on your profile",
  "Free first year — no subscription, ever",
  "Shape the community from day one",
  "Private Founding Sisters channel",
  "Name inscribed in the opening prayer scroll",
];

/* ═══════════════════════════════════════════
   Icons
   ═══════════════════════════════════════════ */

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   HashRouter: plain #anchors replace the whole hash and break #/ routes.
   Use programmatic scroll instead of href="#waitlist".
   ═══════════════════════════════════════════ */

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function CTAButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => scrollToSection("waitlist")}
      className={`inline-flex items-center justify-center px-8 py-4 rounded-pill font-sans text-base font-medium transition-all duration-200 shadow-warm hover:shadow-card hover:-translate-y-0.5 ${className}`}
    >
      {children}
    </button>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow text-way-sage mb-4">{children}</p>;
}

function ScrollFade({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`opacity-0 translate-y-6 animate-[fadeInUp_0.8s_ease-out_forwards] ${className}`}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════ */

type WaitlistStatus = "idle" | "loading" | "success" | "error";

export default function LandingV1() {
  const [email, setEmail] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState<WaitlistStatus>("idle");
  const [waitlistError, setWaitlistError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || waitlistStatus === "loading") return;

    if (!supabaseBrowser) {
      setWaitlistStatus("error");
      setWaitlistError(
        "Waitlist signup is not configured. Please try again later.",
      );
      return;
    }

    setWaitlistStatus("loading");
    setWaitlistError("");

    const { data, error } = await supabaseBrowser.functions.invoke(
      "join-waitlist",
      { body: { email: trimmed } },
    );

    if (error) {
      setWaitlistStatus("error");
      setWaitlistError(
        error.message || "Something went wrong. Please try again.",
      );
      return;
    }

    const payload = data as { success?: boolean; error?: string } | null;
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
  };

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: "#FAFAF8" }}>
      {/* ═══════ Inline Animations ═══════ */}
      <style>{`
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-delay-1 { animation-delay: 0.15s; }
        .animate-delay-2 { animation-delay: 0.30s; }
        .animate-delay-3 { animation-delay: 0.45s; }
        .animate-delay-4 { animation-delay: 0.60s; }
        .animate-delay-5 { animation-delay: 0.75s; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ═══════════════════════════════════════════
          1. HERO
          ═══════════════════════════════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/images/v1-hero.jpg"
            alt="Woman in warm natural light"
            className="w-full h-full object-cover object-[center_30%]"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(250,250,248,0.96) 0%, rgba(250,250,248,0.85) 45%, rgba(250,250,248,0.4) 70%, rgba(250,250,248,0.1) 100%)" }} />
        </div>

        <div className="relative z-10 w-full px-6 md:px-10 lg:px-[8vw] py-20">
          <div className="max-w-2xl">
            <ScrollFade>
              <SectionEyebrow>A HOME FOR WOMEN WALKING THE WAY</SectionEyebrow>
            </ScrollFade>

            <ScrollFade className="animate-delay-1">
              <h1 className="font-serif text-[44px] md:text-[58px] lg:text-[68px] font-medium leading-[1.08] tracking-[-0.02em] text-way-text mb-6">
                You weren't meant<br />to walk this alone.
              </h1>
            </ScrollFade>

            <ScrollFade className="animate-delay-2">
              <p className="font-sans text-lg md:text-xl text-way-gray leading-relaxed max-w-lg mb-8">
                Daily scripture. Real conversation. Five rooms for the woman who wants more than a devotional app — she wants a sisterhood.
              </p>
            </ScrollFade>

            <ScrollFade className="animate-delay-3">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <CTAButton className="bg-way-rose text-white hover:bg-way-rose/90">
                  Join the Waitlist — It's Free
                </CTAButton>
                <a
                  href="/#/garden"
                  className="inline-flex items-center font-sans text-sm font-medium text-way-sage hover:text-way-rose transition-colors group"
                >
                  Peek inside The Garden
                  <span className="ml-1.5 group-hover:translate-x-1 transition-transform">&rarr;</span>
                </a>
              </div>
            </ScrollFade>

            <ScrollFade className="animate-delay-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["/images/v1-sister.jpg", "/images/v1-warm.jpg", "/images/v1-diverse.jpg", "/images/v1-reading.jpg"].map((src, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-way-white overflow-hidden">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="font-sans text-sm text-way-gray">
                  <span className="font-medium text-way-text">2,847</span> sisters already waiting
                </p>
              </div>
            </ScrollFade>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-way-gray/40 animate-bounce">
          <ArrowDownIcon />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          2. THE PROBLEM — "It shouldn't be this hard"
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 px-6 md:px-10 lg:px-[8vw]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <ScrollFade>
              <SectionEyebrow>WHY WE BUILT THIS</SectionEyebrow>
            </ScrollFade>
            <ScrollFade className="animate-delay-1">
              <h2 className="font-serif text-[32px] md:text-[42px] font-medium leading-[1.15] text-way-text mb-6">
                Faith can feel like the loneliest thing in the world.
              </h2>
            </ScrollFade>
            <ScrollFade className="animate-delay-2">
              <div className="space-y-4">
                {[
                  "You read your Bible alone at 6am while the house sleeps.",
                  "You have questions you're afraid to ask in your small group.",
                  "You crave depth but find surface-level chats instead.",
                  "You wonder if anyone else feels this way.",
                ].map((text, i) => (
                  <p key={i} className="font-sans text-base text-way-gray leading-relaxed pl-4 border-l-2 border-way-rose/30">
                    {text}
                  </p>
                ))}
              </div>
            </ScrollFade>
          </div>
          <ScrollFade className="animate-delay-2">
            <div className="relative">
              <img
                src="/images/v1-reading.jpg"
                alt="Woman reading"
                className="w-full h-[420px] md:h-[520px] object-cover rounded-2xl shadow-card"
              />
              <div className="absolute -bottom-5 -left-5 bg-way-surface rounded-xl p-5 shadow-warm max-w-[240px]">
                <p className="font-serif italic text-way-text text-base leading-snug">
                  "I was so tired of doing this by myself."
                </p>
                <p className="font-sans text-xs text-way-gray mt-2">— Jessica R., Early Member</p>
              </div>
            </div>
          </ScrollFade>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3. THE VISION — "The Way is a home"
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#F2F0EB" }}>
        <div className="px-6 md:px-10 lg:px-[8vw] max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <ScrollFade>
              <img
                src="/images/v1-community.jpg"
                alt="Women in community"
                className="w-full h-[400px] md:h-[500px] object-cover rounded-2xl shadow-card order-2 md:order-1"
              />
            </ScrollFade>
            <div className="order-1 md:order-2">
              <ScrollFade className="animate-delay-1">
                <SectionEyebrow>WHAT IS THE WAY</SectionEyebrow>
              </ScrollFade>
              <ScrollFade className="animate-delay-2">
                <h2 className="font-serif text-[32px] md:text-[42px] font-medium leading-[1.15] text-way-text mb-6">
                  A home for women who refuse to settle for shallow faith.
                </h2>
              </ScrollFade>
              <ScrollFade className="animate-delay-3">
                <div className="space-y-5">
                  {[
                    { title: "Scripture that meets you where you are.", desc: "Not a verse of the day you scroll past. A daily word that lands in your chest and stays there." },
                    { title: "Conversation that goes deeper.", desc: "No performative spirituality. Just sisters asking honest questions and walking through answers together." },
                    { title: "Five rooms. One home.", desc: "The Garden for daily growth. The Table for real talk. The Well for living water. The Letter for your story. The Sanctuary for rest." },
                  ].map((item, i) => (
                    <div key={i}>
                      <p className="font-sans text-base font-medium text-way-text">{item.title}</p>
                      <p className="font-sans text-sm text-way-gray leading-relaxed mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </ScrollFade>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. TESTIMONIALS
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 px-6 md:px-10 lg:px-[8vw]">
        <ScrollFade>
          <div className="text-center mb-14">
            <SectionEyebrow>FROM THE SISTERS</SectionEyebrow>
            <h2 className="font-serif text-[32px] md:text-[42px] font-medium leading-[1.15] text-way-text">
              This is what belonging feels like.
            </h2>
          </div>
        </ScrollFade>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <ScrollFade key={i} className={`animate-delay-${i + 1}`}>
              <div className="rounded-2xl p-8 h-full flex flex-col" style={{ backgroundColor: "#F2F0EB" }}>
                <div className="flex-1">
                  <p className="font-serif italic text-[22px] md:text-[24px] text-way-text leading-[1.45] mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-5 border-t border-way-border">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-sans text-sm font-medium text-way-text">{t.name}</p>
                    <p className="font-sans text-xs text-way-gray">{t.role}</p>
                  </div>
                </div>
              </div>
            </ScrollFade>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5. ROOMS TEASER
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#F2F0EB" }}>
        <div className="px-6 md:px-10 lg:px-[8vw]">
          <ScrollFade>
            <div className="text-center mb-14">
              <SectionEyebrow>INSIDE THE WAY</SectionEyebrow>
              <h2 className="font-serif text-[32px] md:text-[42px] font-medium leading-[1.15] text-way-text">
                Five rooms. One home.
              </h2>
            </div>
          </ScrollFade>

          <div className="max-w-4xl mx-auto space-y-4">
            {roomsTeaser.map((room, i) => (
              <ScrollFade key={i} className={`animate-delay-${Math.min(i + 1, 5)}`}>
                <div className="flex items-center gap-4 md:gap-8 py-5 px-6 md:px-8 rounded-xl border border-way-border/60 hover:border-way-rose/40 transition-all group" style={{ backgroundColor: "#FAFAF8" }}>
                  <span className="font-serif text-[32px] md:text-[44px] font-light text-way-border leading-none select-none w-16 text-right">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl md:text-2xl font-medium text-way-text group-hover:text-way-rose transition-colors">
                      {room.name}
                    </h3>
                    <p className="font-sans text-sm text-way-gray mt-0.5">{room.desc}</p>
                  </div>
                  <span className="text-way-rose opacity-0 group-hover:opacity-100 transition-opacity font-sans text-sm">
                    Coming soon &rarr;
                  </span>
                </div>
              </ScrollFade>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          6. FOUNDING SISTERS — Urgency
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 px-6 md:px-10 lg:px-[8vw]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <ScrollFade>
              <SectionEyebrow>LIMITED FOUNDING MEMBERSHIP</SectionEyebrow>
            </ScrollFade>
            <ScrollFade className="animate-delay-1">
              <h2 className="font-serif text-[32px] md:text-[42px] font-medium leading-[1.15] text-way-text mb-6">
                Become a Founding Sister.
              </h2>
            </ScrollFade>
            <ScrollFade className="animate-delay-2">
              <p className="font-sans text-base text-way-gray leading-relaxed mb-8">
                The first 500 women through the door become Founding Sisters — forever recognized inside The Way. Your name on the scroll. Your voice shaping what we become. No subscription. No catch. Just first access to a home built for you.
              </p>
            </ScrollFade>
            <ScrollFade className="animate-delay-3">
              <ul className="space-y-3 mb-8">
                {foundingBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 font-sans text-sm text-way-text">
                    <span className="text-way-sage flex-shrink-0 mt-0.5"><CheckIcon /></span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </ScrollFade>
            <ScrollFade className="animate-delay-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: "#F2F0EB" }}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-way-rose opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-way-rose" />
                </span>
                <span className="font-sans text-sm text-way-text">
                  <span className="font-medium">163</span> of 500 spots claimed
                </span>
              </div>
            </ScrollFade>
          </div>
          <ScrollFade className="animate-delay-2">
            <img
              src="/images/v1-warm.jpg"
              alt="Warm smiling woman"
              className="w-full h-[420px] md:h-[520px] object-cover rounded-2xl shadow-card"
            />
          </ScrollFade>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          7. FINAL WAITLIST CTA
          ═══════════════════════════════════════════ */}
      <section id="waitlist" className="py-24 md:py-32" style={{ backgroundColor: "#F2F0EB" }}>
        <div className="px-6 md:px-10 lg:px-[8vw] max-w-2xl mx-auto text-center">
          <ScrollFade>
            <SectionEyebrow>THE DOORS OPEN SOON</SectionEyebrow>
          </ScrollFade>
          <ScrollFade className="animate-delay-1">
            <h2 className="font-serif text-[36px] md:text-[48px] lg:text-[56px] font-medium leading-[1.1] text-way-text mb-5">
              Your sisters are waiting.
            </h2>
          </ScrollFade>
          <ScrollFade className="animate-delay-2">
            <p className="font-sans text-lg text-way-gray mb-10 max-w-md mx-auto">
              Enter your email. Join the waitlist. Be among the first 500 Founding Sisters.
            </p>
          </ScrollFade>

          <ScrollFade className="animate-delay-3">
            {waitlistStatus === "success" ? (
              <p
                className="max-w-md mx-auto text-xl md:text-2xl leading-relaxed"
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontStyle: "italic",
                  color: "#1C1C1A",
                }}
              >
                You are on the list, sister. We will see you soon.
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={waitlistStatus === "loading"}
                  autoComplete="email"
                  className="w-full sm:flex-1 px-6 py-4 rounded-pill bg-way-white border border-way-border font-sans text-base text-way-text placeholder:text-way-gray/50 focus:outline-none focus:border-way-rose focus:ring-2 focus:ring-way-rose/10 transition-all disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={waitlistStatus === "loading"}
                  className="w-full sm:w-auto btn-pill-primary px-8 py-4 text-base whitespace-nowrap shadow-warm hover:shadow-card disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {waitlistStatus === "loading" ? "Joining..." : "Join the Waitlist"}
                </button>
              </form>
            )}
            {waitlistStatus === "error" && waitlistError ? (
              <p
                className="mt-4 max-w-md mx-auto text-sm text-way-gray"
                role="alert"
              >
                {waitlistError}
              </p>
            ) : null}
          </ScrollFade>

          <ScrollFade className="animate-delay-4">
            <p className="verse-text text-sm text-way-gray/70 mt-8">
              &ldquo;She perceives that her merchandise is profitable.&rdquo; — Proverbs 31:18
            </p>
          </ScrollFade>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          8. FOOTER
          ═══════════════════════════════════════════ */}
      <footer style={{ backgroundColor: "#FAFAF8" }}>
        <div className="h-px bg-way-border" />
        <div className="px-6 md:px-10 lg:px-[8vw] py-10 md:py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <Link to="/" className="flex items-baseline gap-0.5 mb-1">
                <span className="font-serif text-xl font-medium text-way-text">The Way</span>
                <span className="font-sans text-[9px] font-medium text-way-sage tracking-wide ml-0.5 -translate-y-1.5">P31</span>
              </Link>
              <p className="font-sans text-xs text-way-gray">Daily scripture. Real conversation.</p>
            </div>
            <div className="flex items-center gap-6">
              {["About", "Rooms", "Join", "Contact"].map((link) => (
                <a
                  key={link}
                  href="#/"
                  onClick={(e) => {
                    e.preventDefault();
                    if (link === "Join") scrollToSection("waitlist");
                    else scrollToSection(link.toLowerCase());
                  }}
                  className="eyebrow hover:text-way-rose transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
            <p className="verse-text text-xs text-way-gray">For the woman who fears the Lord.</p>
          </div>
          <div className="mt-8 pt-6 border-t border-way-border text-center md:text-left">
            <p className="font-sans text-xs text-way-gray/50">&copy; 2026 Christian App Empire LLC</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
