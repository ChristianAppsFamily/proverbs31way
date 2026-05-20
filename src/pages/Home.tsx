import { useCallback, useEffect, useRef, useLayoutEffect, useState, type MouseEvent } from 'react';
import { Link } from 'react-router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabaseBrowser, fetchWaitlistCount } from '@/lib/supabaseBrowser';

gsap.registerPlugin(ScrollTrigger);

function scrollToWaitlistAnchor(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scrollToWaitlist() {
  document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ───────────────────── Data ───────────────────── */

const rooms = [
  {
    num: '01',
    name: 'The Garden',
    desc: 'A place to grow in faith and wisdom.',
    image: '/images/room-garden.jpg',
  },
  {
    num: '02',
    name: 'The Table',
    desc: 'Come hungry. Leave nourished.',
    image: '/images/room-table.jpg',
  },
  {
    num: '03',
    name: 'The Well',
    desc: 'Draw living water for your soul.',
    image: '/images/room-well.jpg',
  },
  {
    num: '04',
    name: 'The Letter',
    desc: 'Write your heart. Share your story.',
    image: '/images/room-letter.jpg',
  },
  {
    num: '05',
    name: 'The Sanctuary',
    desc: 'Rest, reset, and return to peace.',
    image: '/images/room-sanctuary.jpg',
  },
];

/* ───────────────────── Components ───────────────────── */

function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled ? 'bg-way-white/90 backdrop-blur-md shadow-warm' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-6 md:px-10 lg:px-[8vw] py-4 md:py-5">
        <a href="#" className="flex items-baseline gap-0.5 group">
          <span className="font-serif text-2xl md:text-[28px] font-medium text-way-text tracking-tight">
            The Way
          </span>
          <span className="font-sans text-[10px] font-medium text-way-sage tracking-wide ml-0.5 -translate-y-2">
            P31
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#about" className="eyebrow hover:text-way-rose transition-colors">
            About
          </a>
          <a href="#rooms" className="eyebrow hover:text-way-rose transition-colors">
            Rooms
          </a>
          <a href="#/" onClick={scrollToWaitlistAnchor} className="eyebrow hover:text-way-rose transition-colors">
            Join
          </a>
          <button type="button" onClick={scrollToWaitlist} className="btn-pill-primary text-xs py-2.5 px-5">
            Start Free Trial
          </button>
        </div>

        <button type="button" onClick={scrollToWaitlist} className="md:hidden btn-pill-primary text-xs py-2 px-4">
          Join
        </button>
      </div>
    </nav>
  );
}

function HeroSection({ waitlistCount }: { waitlistCount: number | null }) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const verseCardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.fromTo(imageRef.current, { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 1.2 })
        .fromTo('.hero-eyebrow', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, 0.2)
        .fromTo('.hero-headline span', { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.3)
        .fromTo('.hero-sub', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, 0.7)
        .fromTo('.hero-ctas', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, 0.85)
        .fromTo('.hero-micro', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1)
        .fromTo(verseCardRef.current, { opacity: 0, y: 40, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power2.out' }, 0.4);
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top top', end: '+=80%', scrub: 0.6 },
      });
      scrollTl
        .fromTo(headlineRef.current, { x: 0, opacity: 1 }, { x: '-10vw', opacity: 0, ease: 'power2.in' }, 0.7)
        .fromTo(verseCardRef.current, { y: 0, opacity: 1 }, { y: '-10vh', opacity: 0, ease: 'power2.in' }, 0.7)
        .fromTo(imageRef.current, { scale: 1, opacity: 1 }, { scale: 1.06, opacity: 0, ease: 'power2.in' }, 0.7);
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="relative w-full min-h-[100dvh] bg-way-white overflow-hidden z-10">
      <div className="absolute left-[4vw] top-0 bottom-0 w-px bg-way-text/[0.06] pointer-events-none" />
      <div ref={imageRef} className="absolute right-0 top-0 w-full md:w-[55vw] h-[50vh] md:h-full will-change-transform">
        <img src="/images/hero-woman.jpg" alt="Woman smiling on green sofa with warm blanket" className="w-full h-full object-cover" />
        <div className="absolute inset-0 hidden md:block" style={{ background: 'linear-gradient(90deg, rgba(251,247,242,0.92) 0%, rgba(251,247,242,0.0) 25%)' }} />
        <div className="absolute inset-0 md:hidden" style={{ background: 'linear-gradient(180deg, rgba(251,247,242,0.0) 50%, rgba(251,247,242,0.95) 100%)' }} />
      </div>
      <div ref={headlineRef} className="relative z-10 flex flex-col justify-center min-h-[100dvh] px-6 md:px-0 md:pl-[8vw] pt-[50vh] md:pt-0">
        <div className="max-w-[90vw] md:max-w-[38vw]">
          <p className="hero-eyebrow eyebrow mb-4 md:mb-5">A Home for Women</p>
          <h1 className="hero-headline font-serif text-[42px] md:text-[56px] lg:text-[64px] font-medium leading-[1.1] tracking-[-0.01em] text-way-text mb-5 md:mb-6">
            <span className="block">A home for women</span>
            <span className="block">walking</span>
            <span className="block">The Way.</span>
          </h1>
          <p className="hero-sub font-sans text-[15px] md:text-base text-way-gray leading-relaxed max-w-md mb-6 md:mb-8">
            Daily scripture. Real conversation. Five rooms for the Proverbs 31 woman.
          </p>
          <div className="hero-ctas flex flex-wrap items-center gap-4 mb-5">
            <button type="button" onClick={scrollToWaitlist} className="btn-pill-primary">
              Join the Waitlist
            </button>
            <Link to="/garden" className="inline-flex items-center font-sans text-sm font-medium text-way-sage hover:text-way-rose transition-colors group">
              Step inside <span className="ml-1.5 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
          <p className="hero-micro font-sans text-xs text-way-gray/70 mb-8">
            <span className="font-medium text-way-text tabular-nums">
              {waitlistCount === null ? "…" : waitlistCount.toLocaleString()}
            </span>{" "}
            sisters are already waiting.
          </p>
          <div ref={verseCardRef} className="lg:hidden bg-way-surface rounded-xl shadow-card shadow-inset-verse p-6 will-change-transform">
            <p className="verse-text text-lg mb-4">&ldquo;Let the morning bring me word of your unfailing love, for I have put my trust in you. Show me the way I should go, for to you I entrust my life.&rdquo;</p>
            <p className="eyebrow text-way-sage mb-5">Psalm 143:8</p>
            <div className="flex items-center gap-2.5 pt-4 border-t border-way-border">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-way-sage opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-way-sage" />
              </span>
              <span className="font-sans text-xs text-way-gray">47 sisters in conversation today</span>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block absolute right-[6vw] top-[35vh] w-[32vw] max-w-[420px] bg-way-surface rounded-xl shadow-card shadow-inset-verse p-8 will-change-transform">
        <p className="verse-text text-[20px] lg:text-[22px] mb-5">&ldquo;Let the morning bring me word of your unfailing love, for I have put my trust in you. Show me the way I should go, for to you I entrust my life.&rdquo;</p>
        <p className="eyebrow text-way-sage mb-6">Psalm 143:8</p>
        <div className="flex items-center gap-2.5 pt-4 border-t border-way-border">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-way-sage opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-way-sage" />
          </span>
          <span className="font-sans text-xs text-way-gray">47 sisters in conversation today</span>
        </div>
      </div>
    </section>
  );
}

function FiveRoomsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [activeRoom, setActiveRoom] = useState(0);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current, { opacity: 0, y: '-6vh' }, {
        opacity: 1, y: 0,
        scrollTrigger: { trigger: section, start: 'top 80%', end: 'top 40%', scrub: 0.5 },
      });
      gsap.fromTo('.room-item', { opacity: 0, x: '-10vw' }, {
        opacity: 1, x: 0, stagger: 0.06,
        scrollTrigger: { trigger: section, start: 'top 70%', end: 'top 30%', scrub: 0.5 },
      });
      gsap.fromTo(imageRef.current, { opacity: 0, x: '12vw', scale: 1.04 }, {
        opacity: 1, x: 0, scale: 1,
        scrollTrigger: { trigger: section, start: 'top 60%', end: 'top 20%', scrub: 0.5 },
      });
      const exitTl = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'bottom 90%', end: 'bottom top', scrub: 0.6 },
      });
      exitTl
        .fromTo(headingRef.current, { opacity: 1, y: 0 }, { opacity: 0, y: '-6vh', ease: 'power2.in' }, 0)
        .fromTo(listRef.current, { opacity: 1, x: 0 }, { opacity: 0, x: '-8vw', ease: 'power2.in' }, 0)
        .fromTo(imageRef.current, { opacity: 1, scale: 1, x: 0 }, { opacity: 0, scale: 1.06, x: '-6vw', ease: 'power2.in' }, 0);
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="rooms" className="relative w-full min-h-[100dvh] bg-way-surface overflow-hidden z-20 py-16 md:py-0 md:flex md:items-center">
      <div className="absolute left-[4vw] top-0 bottom-0 w-px bg-way-text/[0.06] pointer-events-none" />
      <div className="w-full px-6 md:px-0 md:pl-[8vw] md:pr-[6vw]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-0 items-center">
          <div className="md:pr-12">
            <div ref={headingRef} className="mb-10 md:mb-14">
              <p className="eyebrow mb-3 md:mb-4">The Rooms</p>
              <h2 className="font-serif text-[32px] md:text-[44px] lg:text-[48px] font-medium leading-[1.15] text-way-text max-w-md">
                Every woman needs a room of her own.
              </h2>
            </div>
            <div ref={listRef} className="space-y-5 md:space-y-6 max-w-sm">
              {rooms.map((room, i) => (
                <div key={room.num} className="room-item group cursor-pointer" onMouseEnter={() => setActiveRoom(i)}>
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-[28px] md:text-[36px] font-light text-way-border leading-none select-none">{room.num}</span>
                    <div className="flex-1">
                      <h3 className="font-serif text-lg md:text-xl font-medium text-way-text group-hover:text-way-rose transition-colors">{room.name}</h3>
                      <p className="font-sans text-sm text-way-gray mt-0.5">{room.desc}</p>
                      <div className="mt-2 h-0.5 bg-way-border relative overflow-hidden">
                        <div className={`absolute inset-y-0 left-0 bg-way-rose transition-transform duration-500 origin-left ${i === activeRoom ? 'scale-x-100' : 'scale-x-0'}`} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div ref={imageRef} className="relative h-[45vh] md:h-[72vh] rounded-xl overflow-hidden will-change-transform">
            {rooms.map((room, i) => (
              <img key={room.num} src={room.image} alt={room.name} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === activeRoom ? 'opacity-100' : 'opacity-0'}`} />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-way-text/10 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}

function WaitlistSection({ waitlistCount }: { waitlistCount: number | null }) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current, { opacity: 0, y: '10vh', scale: 0.98 }, {
        opacity: 1, y: 0, scale: 1,
        scrollTrigger: { trigger: section, start: 'top 80%', end: 'top 30%', scrub: 0.5 },
      });
      gsap.fromTo(leftRef.current, { opacity: 0, x: '-6vw' }, {
        opacity: 1, x: 0,
        scrollTrigger: { trigger: section, start: 'top 70%', end: 'top 30%', scrub: 0.5 },
      });
      gsap.fromTo(rightRef.current, { opacity: 0, x: '6vw' }, {
        opacity: 1, x: 0,
        scrollTrigger: { trigger: section, start: 'top 70%', end: 'top 30%', scrub: 0.5 },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="waitlist" className="relative w-full bg-way-white py-16 md:py-24 lg:py-32 z-30">
      <div className="max-w-[920px] mx-auto px-6 md:px-10">
        <div ref={cardRef} className="bg-way-surface rounded-2xl p-8 md:p-12 lg:p-16 shadow-card will-change-transform">
          <div ref={leftRef} className="text-center mb-12 md:mb-16">
            <h2 className="font-serif text-[32px] md:text-[44px] lg:text-[48px] font-medium leading-[1.15] text-way-text mb-4">The doors open soon.</h2>
            <p className="font-sans text-base text-way-gray max-w-md mx-auto mb-8">Founding Sisters receive lifetime recognition inside the community.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-5">
              <input type="email" placeholder="Enter your email" className="w-full sm:flex-1 px-5 py-3 rounded-lg bg-way-white border border-way-border font-sans text-sm text-way-text placeholder:text-way-gray/60 focus:outline-none focus:border-way-rose focus:ring-1 focus:ring-way-rose/20 transition-all" />
              <button className="btn-pill-primary w-full sm:w-auto whitespace-nowrap">Notify Me</button>
            </div>
            <p className="font-sans text-sm text-way-sage mb-3">
              <span className="font-medium text-way-text tabular-nums">
                {waitlistCount === null ? "…" : waitlistCount.toLocaleString()}
              </span>{" "}
              women are already waiting.
            </p>
            <p className="verse-text text-sm text-way-gray/80">&ldquo;She perceives that her merchandise is profitable.&rdquo; &mdash; Proverbs 31:18</p>
          </div>
          <div ref={rightRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 relative">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-way-text/10 -translate-x-px" />
            <div className="md:pr-10">
              <div className="flex items-center gap-3 mb-5">
                <svg width="24" height="40" viewBox="0 0 24 40" fill="none" className="text-way-sage">
                  <path d="M12 40V20M12 20C12 20 4 16 4 8C4 4 8 2 12 2C16 2 20 4 20 8C20 16 12 20 12 20Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 28C8 24 2 22 2 16M12 24C16 20 22 18 22 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <h3 className="font-serif text-xl md:text-2xl font-medium text-way-text">You invite her</h3>
              </div>
              <ul className="space-y-3">
                {['1 month free for every 3 sisters who join', 'Exclusive Founding Sister badge', 'Early access to new rooms'].map((item) => (
                  <li key={item} className="font-sans text-sm text-way-gray flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-way-rose mt-2 flex-shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:pl-10">
              <div className="flex items-center gap-3 mb-5">
                <svg width="24" height="40" viewBox="0 0 24 40" fill="none" className="text-way-rose">
                  <path d="M12 2C12 2 4 10 4 18C4 26 12 32 12 32C12 32 20 26 20 18C20 10 12 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="18" r="3" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <h3 className="font-serif text-xl md:text-2xl font-medium text-way-text">She receives</h3>
              </div>
              <ul className="space-y-3">
                {['First month free', 'Welcome gift: guided prayer journal', 'Instant access to The Table community'].map((item) => (
                  <li key={item} className="font-sans text-sm text-way-gray flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-way-sage mt-2 flex-shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuoteSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(bgRef.current, { yPercent: 0, scale: 1 }, {
        yPercent: 12, scale: 1.05,
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
      });
      gsap.fromTo(textRef.current, { opacity: 0, y: '6vh', scale: 0.98 }, {
        opacity: 1, y: 0, scale: 1,
        scrollTrigger: { trigger: section, start: 'top 75%', end: 'top 25%', scrub: 0.5 },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full min-h-[70vh] md:min-h-[80vh] overflow-hidden z-40 flex items-center justify-center">
      <div ref={bgRef} className="absolute inset-0 will-change-transform scale-105">
        <img src="/images/quote-bg.jpg" alt="Warm atmospheric interior" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 45%, rgba(251,247,242,0.65), rgba(251,247,242,0.30))' }} />
      </div>
      <div ref={textRef} className="relative z-10 text-center px-6 max-w-[56vw] min-w-[300px] will-change-transform">
        <blockquote className="font-serif italic text-[26px] md:text-[36px] lg:text-[42px] font-light leading-[1.35] text-way-text mb-6 drop-shadow-warm">
          &ldquo;I have never felt less alone in my walk with God.&rdquo;
        </blockquote>
        <cite className="font-sans text-sm md:text-base text-way-gray not-italic">&mdash; Sarah M., Founding Sister</cite>
      </div>
    </section>
  );
}

function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.footer-content', { opacity: 0, y: '4vh' }, {
        opacity: 1, y: 0,
        scrollTrigger: { trigger: footer, start: 'top 90%', end: 'top 50%', scrub: 0.5 },
      });
      gsap.fromTo('.footer-tagline', { opacity: 0, x: '4vw' }, {
        opacity: 1, x: 0,
        scrollTrigger: { trigger: footer, start: 'top 85%', end: 'top 50%', scrub: 0.5 },
      });
    }, footer);
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative w-full bg-way-surface z-50">
      <div className="h-px bg-way-text/10" />
      <div className="px-6 md:px-10 lg:px-[8vw] py-10 md:py-14">
        <div className="footer-content flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <a href="#" className="flex items-baseline gap-0.5 mb-2">
              <span className="font-serif text-2xl font-medium text-way-text">The Way</span>
              <span className="font-sans text-[10px] font-medium text-way-sage tracking-wide ml-0.5 -translate-y-2">P31</span>
            </a>
            <p className="font-sans text-xs text-way-gray">Daily scripture. Real conversation.</p>
          </div>
          <div className="flex items-center gap-6 md:gap-8">
            {['About', 'Rooms', 'Join', 'Contact'].map((link) =>
              link === 'Join' ? (
                <a
                  key={link}
                  href="#/"
                  onClick={scrollToWaitlistAnchor}
                  className="eyebrow hover:text-way-rose transition-colors"
                >
                  {link}
                </a>
              ) : (
                <a key={link} href={`#${link.toLowerCase()}`} className="eyebrow hover:text-way-rose transition-colors">
                  {link}
                </a>
              ),
            )}
          </div>
          <div className="footer-tagline">
            <p className="verse-text text-sm text-way-gray">For the woman who fears the Lord.</p>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-way-border">
          <p className="font-sans text-xs text-way-gray/60 text-center md:text-left">&copy; 2026 Christian App Empire LLC</p>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────── Home Page ───────────────────── */

export default function HomePage() {
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  const refreshWaitlistCount = useCallback(async () => {
    const n = await fetchWaitlistCount();
    if (n !== null) setWaitlistCount(n);
  }, []);

  useEffect(() => {
    void refreshWaitlistCount();

    const channel = supabaseBrowser
      .channel("waitlist-home-count")
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
    const setupSnap = () => {
      const pinned = ScrollTrigger.getAll().filter((st) => st.vars.pin).sort((a, b) => a.start - b.start);
      const maxScroll = ScrollTrigger.maxScroll(window);
      if (!maxScroll || pinned.length === 0) return;
      const pinnedRanges = pinned.map((st) => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));
      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            const inPinned = pinnedRanges.some((r) => value >= r.start - 0.02 && value <= r.end + 0.02);
            if (!inPinned) return value;
            const target = pinnedRanges.reduce((closest, r) => Math.abs(r.center - value) < Math.abs(closest - value) ? r.center : closest, pinnedRanges[0]?.center ?? 0);
            return target;
          },
          duration: { min: 0.15, max: 0.35 }, delay: 0, ease: 'power2.out',
        },
      });
    };
    const timer = setTimeout(setupSnap, 500);
    return () => { clearTimeout(timer); ScrollTrigger.getAll().forEach((st) => st.kill()); };
  }, []);

  return (
    <div className="relative">
      <Navigation />
      <main className="relative">
        <HeroSection waitlistCount={waitlistCount} />
        <FiveRoomsSection />
        <WaitlistSection waitlistCount={waitlistCount} />
        <QuoteSection />
        <Footer />
      </main>
      <div className="fixed inset-0 pointer-events-none z-[200] opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '200px 200px', mixBlendMode: 'multiply' }} />
    </div>
  );
}
