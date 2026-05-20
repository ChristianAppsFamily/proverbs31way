/**
 * RoomLayout, Shared three-column shell for all five rooms.
 *
 * Renders:
 *   1. Fixed nav bar (logo left, room name right)
 *   2. Left sidebar: date list, reading streak, room navigation
 *   3. Center column: {children}, the only thing that changes per room
 *   4. Right sidebar: "Sisters in conversation" comment feed
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

export interface RoomLayoutProps {
  roomName: string;        // "THE GARDEN", "THE TABLE", etc.
  roomSlug: string;        // "garden", "table", "well", "letter", "sanctuary"
  children: React.ReactNode;
}

/* ═══════════════════════════════════════════
   Room meta data
   ═══════════════════════════════════════════ */

const ROOMS = [
  { slug: "garden",    name: "THE GARDEN",    icon: LeafIcon },
  { slug: "table",     name: "THE TABLE",     icon: UsersIcon },
  { slug: "well",      name: "THE WELL",      icon: DropletIcon },
  { slug: "letter",    name: "THE LETTER",    icon: MailIcon },
  { slug: "sanctuary", name: "THE SANCTUARY", icon: HeartIcon },
] as const;

/* ═══════════════════════════════════════════
   Icons
   ═══════════════════════════════════════════ */

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 5.2 20 2.2 20 2.2s-2 5.5-3.4 10.7a7 7 0 0 1-5.6 7.1Z" />
      <path d="M11 20v-6.6a7 7 0 0 1 7.9-6" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function DropletIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-6.2S12 3.3 12 2 9.5 4.8 8 7.2 5 13 5 15a7 7 0 0 0 7 7z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */

function toDateInput(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatDayName(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}

function formatDayNum(dateStr: string): string {
  return String(new Date(dateStr + "T00:00:00").getDate());
}

/* ═══════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════ */

/** Single comment bubble */
function CommentBubble({ name, body, time }: { name: string; body: string; time: Date }) {
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "S";
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-way-rose text-white flex items-center justify-center text-[11px] font-sans font-medium flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-sans text-sm font-medium text-way-text">{name || "Sister"}</span>
          <span className="font-sans text-[11px] text-way-gray/60">
            {time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
        <p className="font-sans text-sm text-way-gray leading-relaxed mt-0.5">{body}</p>
      </div>
    </div>
  );
}

/** Comment sidebar content, shared by desktop right sidebar and mobile */
function SistersPanel({
  roomSlug,
  onJoinWaitlist,
}: {
  roomSlug: string;
  onJoinWaitlist: () => void;
}) {
  const { isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState("");
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const { data: comments, refetch } = trpc.room.listComments.useQuery(
    { roomSlug },
    { retry: false }
  );

  const createComment = trpc.room.createComment.useMutation({
    onSuccess: () => {
      setCommentText("");
      refetch();
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    createComment.mutate({ roomSlug, body: commentText.trim() });
  };

  const commentList = comments ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E8E2DA] flex items-center gap-2 flex-shrink-0">
        <span className="font-sans text-sm font-medium text-way-text">Sisters in conversation</span>
        <span className="relative flex h-2 w-2">
          <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-way-sage opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-way-sage" />
        </span>
      </div>

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 min-h-0">
        {commentList.length > 0 ? (
          commentList.map((c) => (
            <CommentBubble key={c.id} name={c.userName || "Sister"} body={c.body} time={c.createdAt} />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="font-sans text-sm text-way-gray/60">Be the first to share your thoughts.</p>
          </div>
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* Input or prompt */}
      <div className="px-5 py-4 border-t border-[#E8E2DA] flex-shrink-0">
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your reflection..."
              className="flex-1 px-4 py-2.5 rounded-full bg-[#F5F2ED] border border-[#E8E2DA] font-sans text-sm text-way-text placeholder:text-way-gray/50 focus:outline-none focus:border-way-rose transition-all"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || createComment.isPending}
              className="w-10 h-10 rounded-full bg-way-rose text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity flex-shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </form>
        ) : (
          <div className="text-center py-2">
            <p className="font-sans text-sm text-way-gray mb-2">Join the conversation</p>
            <button
              type="button"
              onClick={onJoinWaitlist}
              className="font-sans text-sm font-medium text-way-rose hover:opacity-80 transition-opacity bg-transparent border-0 cursor-pointer p-0"
            >
              Sign in to share &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Layout Component
   ═══════════════════════════════════════════ */

export default function RoomLayout({ roomName, roomSlug, children }: RoomLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  /* ── Date state ── */
  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayStr = toDateInput(today);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  /* ── Build week (Mon-Sun) with fallback verse refs ── */
  const verseRefs = ["Prov 31:25", "Psalm 143:8", "Jer 17:7", "Matt 11:28", "Psalm 23:1", "Eph 2:10", "Neh 8:10"];
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    const mondayOffset = dayOfWeek === 0 ? -6 : 1;
    d.setDate(d.getDate() - dayOfWeek + mondayOffset + i);
    const dateStr = toDateInput(d);
    const idx = (d.getDay() + 6) % 7;
    return { id: i + 1, reference: verseRefs[idx], publishDate: dateStr };
  });

  /* ── tRPC: streak ── */
  const { data: streak } = trpc.garden.getReadingStreak.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  /* ── Update streak on first load ── */
  const updateStreak = trpc.garden.updateReadingStreak.useMutation();
  useEffect(() => {
    if (isAuthenticated) updateStreak.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const goToWaitlist = useCallback(() => {
    navigate("/");
    window.setTimeout(() => {
      document.getElementById("waitlist")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  }, [navigate]);

  /* ── Nav to garden with date ── */
  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    if (roomSlug !== "garden") {
      navigate("/garden");
    }
  };

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: "#FAFAF8" }}>
      {/* ═══════ Navigation ═══════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#E8E2DA]" style={{ backgroundColor: "rgba(250,250,248,0.92)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-baseline gap-0.5">
            <span className="font-serif text-xl font-medium text-way-text tracking-tight">The Way</span>
            <span className="font-sans text-[9px] font-medium text-way-sage tracking-wide ml-0.5 -translate-y-1.5">P31</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <span className="hidden md:inline eyebrow text-way-sage">{roomName}</span>
            {isAuthenticated && user ? (
              <div className="w-7 h-7 rounded-full bg-way-rose text-white flex items-center justify-center text-[10px] font-sans font-medium">
                {user.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "Me"}
              </div>
            ) : (
              <button type="button" onClick={goToWaitlist} className="btn-pill-primary text-xs py-1.5 px-4">
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ═══════ Mobile Date Strip ═══════ */}
      <div className="lg:hidden fixed top-[53px] left-0 right-0 z-40 border-b border-[#E8E2DA]" style={{ backgroundColor: "#FAFAF8" }}>
        <div className="flex overflow-x-auto px-4 py-3 gap-2 no-scrollbar">
          {weekData.map((day) => {
            const isActive = day.publishDate === selectedDate;
            return (
              <button
                key={day.id}
                onClick={() => handleDateClick(day.publishDate)}
                className={`flex flex-col items-center min-w-[52px] py-2 rounded-lg transition-all ${
                  isActive ? "bg-way-rose/10 border border-way-rose/30" : "border border-transparent hover:bg-[#F5F2ED]"
                }`}
              >
                <span className={`font-sans text-[10px] font-medium tracking-wide ${isActive ? "text-way-rose" : "text-way-gray"}`}>
                  {formatDayName(day.publishDate)}
                </span>
                <span className={`font-sans text-lg font-medium leading-none mt-0.5 ${isActive ? "text-way-rose" : "text-way-text"}`}>
                  {formatDayNum(day.publishDate)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════ Main Three-Column Layout ═══════ */}
      <div className="pt-[53px] lg:pt-[61px] flex min-h-[calc(100dvh-53px)]">

        {/* ─── Left Sidebar (desktop) ─── */}
        <aside
          className="hidden lg:block w-[240px] flex-shrink-0 sticky top-[61px] h-[calc(100dvh-61px)] overflow-y-auto"
          style={{ backgroundColor: "#F5F2ED", borderRight: "1px solid #E8E2DA" }}
        >
          <div className="p-5">
            {/* Today's date */}
            <p className="eyebrow text-way-sage mb-4">{formatDisplayDate(selectedDate)}</p>

            {/* Week list */}
            <div className="space-y-0.5">
              {weekData.map((day) => {
                const isActive = day.publishDate === selectedDate;
                return (
                  <button
                    key={day.id}
                    onClick={() => handleDateClick(day.publishDate)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-baseline gap-2 ${
                      isActive ? "bg-[#FAFAF8] border-l-2 border-way-rose" : "hover:bg-[#FAFAF8]/50 border-l-2 border-transparent"
                    }`}
                  >
                    <span className={`font-sans text-xs ${isActive ? "text-way-rose font-medium" : "text-way-gray"}`}>
                      {formatDayName(day.publishDate)}
                    </span>
                    <span className="font-sans text-xs text-way-gray/50">{day.reference}</span>
                  </button>
                );
              })}
            </div>

            {/* Streak */}
            <div className="mt-6 pt-5 border-t border-[#E8E2DA]">
              <div className="flex items-center gap-2 text-way-sage">
                <FlameIcon />
                <span className="font-sans text-sm font-medium">
                  {streak?.currentStreak ?? 0} day{(streak?.currentStreak ?? 0) !== 1 ? "s" : ""} streak
                </span>
              </div>
            </div>

            {/* Room Navigation */}
            <div className="mt-6 pt-5 border-t border-[#E8E2DA]">
              <p className="eyebrow text-way-gray mb-3">THE ROOMS</p>
              <div className="space-y-0.5">
                {ROOMS.map((room) => {
                  const isActive = room.slug === roomSlug;
                  const Icon = room.icon;
                  return (
                    <Link
                      key={room.slug}
                      to={`/${room.slug}`}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${
                        isActive
                          ? "bg-[#FAFAF8] text-way-rose font-medium"
                          : "text-way-gray hover:bg-[#FAFAF8]/50 hover:text-way-text"
                      }`}
                    >
                      <Icon className={isActive ? "text-way-rose" : "text-way-gray/60"} />
                      <span className="font-sans text-xs tracking-wide">{room.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* ─── Center Column ─── */}
        <main className="flex-1 max-w-[720px] mx-auto w-full mt-[76px] lg:mt-0">
          <div
            className="min-h-[calc(100dvh-61px)] px-6 py-8 lg:px-10 lg:py-10"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            {children}

            {/* Mobile: Sisters Panel */}
            <div className="lg:hidden mt-12 pt-8 border-t border-[#E8E2DA]">
              <SistersPanel roomSlug={roomSlug} onJoinWaitlist={goToWaitlist} />
            </div>
          </div>
        </main>

        {/* ─── Right Sidebar (desktop) ─── */}
        <aside
          className="hidden lg:flex w-[280px] flex-shrink-0 sticky top-[61px] h-[calc(100dvh-61px)] flex-col"
          style={{ backgroundColor: "#F5F2ED", borderLeft: "1px solid #E8E2DA" }}
        >
          <SistersPanel roomSlug={roomSlug} onJoinWaitlist={goToWaitlist} />
        </aside>
      </div>
    </div>
  );
}
