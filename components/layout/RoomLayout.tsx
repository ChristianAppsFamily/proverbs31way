"use client";

/**
 * RoomLayout, Shared three-column shell for all five rooms.
 *
 * Renders:
 *   1. Fixed nav bar (logo left, room name right)
 *   2. Left sidebar: date list, reading streak, room navigation
 *   3. Center column: {children}, the only thing that changes per room
 *   4. Right sidebar: "Sisters in conversation" comment feed
 */

import CommentFeed from "../ui/CommentFeed";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const colors = {
  base: "#FAFAF8",
  rose: "#D4847A",
  sage: "#6B9E8F",
  text: "#1C1C1A",
  surface: "#F5F2ED",
  border: "#E2DDD6",
  muted: "#8A7E72",
  center: "#FFFFFF",
} as const;

export interface RoomLayoutProps {
  roomName: string;
  roomSlug: string;
  children: ReactNode;
  readingStreak?: number;
  isAuthenticated?: boolean;
  userInitials?: string;
}

const ROOMS = [
  { slug: "garden", name: "THE GARDEN", icon: LeafIcon },
  { slug: "table", name: "THE TABLE", icon: UsersIcon },
  { slug: "well", name: "THE WELL", icon: DropletIcon },
  { slug: "letter", name: "THE LETTER", icon: MailIcon },
  { slug: "sanctuary", name: "THE SANCTUARY", icon: HeartIcon },
] as const;

type RoomDateContextValue = {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
};

const RoomDateContext = createContext<RoomDateContextValue | null>(null);

export function useRoomDate() {
  const ctx = useContext(RoomDateContext);
  if (!ctx) {
    throw new Error("useRoomDate must be used within RoomLayout");
  }
  return ctx;
}

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

function buildWeekData(today: Date) {
  const dayOfWeek = today.getDay();
  const verseRefs = ["Prov 31:25", "Psalm 143:8", "Jer 17:7", "Matt 11:28", "Psalm 23:1", "Eph 2:10", "Neh 8:10"];

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    const mondayOffset = dayOfWeek === 0 ? -6 : 1;
    d.setDate(d.getDate() - dayOfWeek + mondayOffset + i);
    const dateStr = toDateInput(d);
    const idx = (d.getDay() + 6) % 7;
    return { id: i + 1, reference: verseRefs[idx], publishDate: dateStr };
  });
}

function useLocalReadingStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const key = "way-reading-streak";
    const today = toDateInput(new Date());
    try {
      const raw = localStorage.getItem(key);
      const stored = raw ? (JSON.parse(raw) as { count: number; lastVisit: string }) : null;
      if (!stored) {
        localStorage.setItem(key, JSON.stringify({ count: 1, lastVisit: today }));
        setStreak(1);
        return;
      }
      if (stored.lastVisit === today) {
        setStreak(stored.count);
        return;
      }
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const nextCount = stored.lastVisit === toDateInput(yesterday) ? stored.count + 1 : 1;
      localStorage.setItem(key, JSON.stringify({ count: nextCount, lastVisit: today }));
      setStreak(nextCount);
    } catch {
      setStreak(0);
    }
  }, []);

  return streak;
}

export default function RoomLayout({
  roomName,
  roomSlug,
  children,
  readingStreak: readingStreakProp,
  isAuthenticated = false,
  userInitials = "Me",
}: RoomLayoutProps) {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const todayStr = toDateInput(today);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const localStreak = useLocalReadingStreak();
  const streak = readingStreakProp ?? localStreak;
  const weekData = useMemo(() => buildWeekData(today), [today]);

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    if (roomSlug !== "garden") {
      router.push("/garden");
    }
  };

  const dateContext = useMemo(
    () => ({ selectedDate, setSelectedDate }),
    [selectedDate],
  );

  return (
    <RoomDateContext.Provider value={dateContext}>
      <div className="min-h-[100dvh]" style={{ backgroundColor: colors.base }}>
        <nav
          className="fixed top-0 left-0 right-0 z-50"
          style={{
            backgroundColor: "rgba(250,250,248,0.92)",
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-3">
            <Link href="/" className="flex items-baseline gap-0.5">
              <span
                className="text-xl font-medium tracking-tight"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', color: colors.text }}
              >
                The Way
              </span>
              <span
                className="text-[9px] font-medium tracking-wide ml-0.5 -translate-y-1.5"
                style={{ fontFamily: '"DM Sans", system-ui, sans-serif', color: colors.sage }}
              >
                P31
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <span
                className="hidden md:inline text-[11px] font-medium tracking-[0.14em] uppercase"
                style={{ fontFamily: '"DM Sans", system-ui, sans-serif', color: colors.sage }}
              >
                {roomName}
              </span>
              {isAuthenticated ? (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium"
                  style={{
                    backgroundColor: colors.rose,
                    color: "#FFFFFF",
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                  }}
                >
                  {userInitials}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-xs py-1.5 px-4 rounded-full font-medium text-white hover:opacity-90 transition-opacity"
                  style={{ fontFamily: '"DM Sans", system-ui, sans-serif', backgroundColor: colors.rose }}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </nav>

        <div
          className="lg:hidden fixed top-[53px] left-0 right-0 z-40"
          style={{ backgroundColor: colors.base, borderBottom: `1px solid ${colors.border}` }}
        >
          <div className="flex overflow-x-auto px-4 py-3 gap-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {weekData.map((day) => {
              const isActive = day.publishDate === selectedDate;
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => handleDateClick(day.publishDate)}
                  className="flex flex-col items-center min-w-[52px] py-2 rounded-lg transition-all"
                  style={{
                    backgroundColor: isActive ? `${colors.rose}1A` : "transparent",
                    border: isActive ? `1px solid ${colors.rose}4D` : "1px solid transparent",
                  }}
                >
                  <span
                    className="text-[10px] font-medium tracking-wide"
                    style={{
                      fontFamily: '"DM Sans", system-ui, sans-serif',
                      color: isActive ? colors.rose : colors.muted,
                    }}
                  >
                    {formatDayName(day.publishDate)}
                  </span>
                  <span
                    className="text-lg font-medium leading-none mt-0.5"
                    style={{
                      fontFamily: '"DM Sans", system-ui, sans-serif',
                      color: isActive ? colors.rose : colors.text,
                    }}
                  >
                    {formatDayNum(day.publishDate)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-[53px] lg:pt-[61px] flex min-h-[calc(100dvh-53px)]">
          <aside
            className="hidden lg:block w-[240px] flex-shrink-0 sticky top-[61px] h-[calc(100dvh-61px)] overflow-y-auto"
            style={{ backgroundColor: colors.surface, borderRight: `1px solid ${colors.border}` }}
          >
            <div className="p-5">
              <p
                className="text-[11px] font-medium tracking-[0.14em] uppercase mb-4"
                style={{ fontFamily: '"DM Sans", system-ui, sans-serif', color: colors.sage }}
              >
                {formatDisplayDate(selectedDate)}
              </p>

              <div className="space-y-0.5">
                {weekData.map((day) => {
                  const isActive = day.publishDate === selectedDate;
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleDateClick(day.publishDate)}
                      className="w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-baseline gap-2"
                      style={{
                        backgroundColor: isActive ? colors.base : "transparent",
                        borderLeft: isActive ? `2px solid ${colors.rose}` : "2px solid transparent",
                      }}
                    >
                      <span
                        className="text-xs"
                        style={{
                          fontFamily: '"DM Sans", system-ui, sans-serif',
                          color: isActive ? colors.rose : colors.muted,
                          fontWeight: isActive ? 500 : 400,
                        }}
                      >
                        {formatDayName(day.publishDate)}
                      </span>
                      <span
                        className="text-xs"
                        style={{ fontFamily: '"DM Sans", system-ui, sans-serif', color: `${colors.muted}80` }}
                      >
                        {day.reference}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${colors.border}` }}>
                <div className="flex items-center gap-2" style={{ color: colors.sage }}>
                  <FlameIcon />
                  <span className="text-sm font-medium" style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}>
                    {streak} day{streak !== 1 ? "s" : ""} streak
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${colors.border}` }}>
                <p
                  className="text-[11px] font-medium tracking-[0.14em] uppercase mb-3"
                  style={{ fontFamily: '"DM Sans", system-ui, sans-serif', color: colors.muted }}
                >
                  THE ROOMS
                </p>
                <div className="space-y-0.5">
                  {ROOMS.map((room) => {
                    const isActive = room.slug === roomSlug;
                    const Icon = room.icon;
                    return (
                      <Link
                        key={room.slug}
                        href={`/${room.slug}`}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all"
                        style={{
                          backgroundColor: isActive ? colors.base : "transparent",
                          color: isActive ? colors.rose : colors.muted,
                          fontWeight: isActive ? 500 : 400,
                        }}
                      >
                        <Icon className={isActive ? "" : "opacity-60"} />
                        <span
                          className="text-xs tracking-wide"
                          style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
                        >
                          {room.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1 max-w-[720px] mx-auto w-full mt-[76px] lg:mt-0">
            <div
              className="min-h-[calc(100dvh-61px)] px-6 py-8 lg:px-10 lg:py-10"
              style={{ backgroundColor: colors.center }}
            >
              {children}

              <div className="lg:hidden mt-12 pt-8" style={{ borderTop: `1px solid ${colors.border}` }}>
                <CommentFeed roomSlug={roomSlug} isAuthenticated={isAuthenticated} />
              </div>
            </div>
          </main>

          <aside
            className="hidden lg:flex w-[280px] flex-shrink-0 sticky top-[61px] h-[calc(100dvh-61px)] flex-col"
            style={{ backgroundColor: colors.surface, borderLeft: `1px solid ${colors.border}` }}
          >
            <CommentFeed roomSlug={roomSlug} isAuthenticated={isAuthenticated} />
          </aside>
        </div>
      </div>
    </RoomDateContext.Provider>
  );
}
