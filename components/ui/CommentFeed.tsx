"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";

const colors = {
  rose: "#D4847A",
  sage: "#6B9E8F",
  text: "#1C1C1A",
  surface: "#F5F2ED",
  border: "#E2DDD6",
  muted: "#8A7E72",
} as const;

export type CommentItem = {
  id: string;
  userName: string;
  body: string;
  createdAt: Date;
};

type CommentFeedProps = {
  roomSlug: string;
  comments?: CommentItem[];
  isAuthenticated?: boolean;
  onSubmitComment?: (body: string) => void | Promise<void>;
};

function CommentBubble({ name, body, time }: { name: string; body: string; time: Date }) {
  const initials =
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "S";

  return (
    <div className="flex gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0"
        style={{
          backgroundColor: colors.rose,
          color: "#FFFFFF",
          fontFamily: '"DM Sans", system-ui, sans-serif',
        }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span
            className="text-sm font-medium"
            style={{ fontFamily: '"DM Sans", system-ui, sans-serif', color: colors.text }}
          >
            {name || "Sister"}
          </span>
          <span
            className="text-[11px]"
            style={{ fontFamily: '"DM Sans", system-ui, sans-serif', color: `${colors.muted}99` }}
          >
            {time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
        <p
          className="text-sm leading-relaxed mt-0.5"
          style={{ fontFamily: '"DM Sans", system-ui, sans-serif', color: colors.muted }}
        >
          {body}
        </p>
      </div>
    </div>
  );
}

export default function CommentFeed({
  roomSlug: _roomSlug,
  comments: initialComments = [],
  isAuthenticated = false,
  onSubmitComment,
}: CommentFeedProps) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const body = commentText.trim();
    if (!body || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (onSubmitComment) {
        await onSubmitComment(body);
      } else {
        setComments((prev) => [
          ...prev,
          {
            id: `local-${Date.now()}`,
            userName: "You",
            body,
            createdAt: new Date(),
          },
        ]);
      }
      setCommentText("");
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className="px-5 py-4 flex items-center gap-2 flex-shrink-0"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <span
          className="text-sm font-medium"
          style={{ fontFamily: '"DM Sans", system-ui, sans-serif', color: colors.text }}
        >
          Sisters in conversation
        </span>
        <span className="relative flex h-2 w-2">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-pulse"
            style={{ backgroundColor: colors.sage }}
          />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: colors.sage }} />
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 min-h-0">
        {comments.length > 0 ? (
          comments.map((c) => (
            <CommentBubble key={c.id} name={c.userName} body={c.body} time={c.createdAt} />
          ))
        ) : (
          <div className="text-center py-8">
            <p
              className="text-sm"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif', color: `${colors.muted}99` }}
            >
              Be the first to share your thoughts.
            </p>
          </div>
        )}
        <div ref={commentsEndRef} />
      </div>

      <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${colors.border}` }}>
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your reflection..."
              className="flex-1 px-4 py-2.5 rounded-full text-sm focus:outline-none transition-all"
              style={{
                fontFamily: '"DM Sans", system-ui, sans-serif',
                color: colors.text,
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
              }}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40 transition-opacity flex-shrink-0"
              style={{ backgroundColor: colors.rose, color: "#FFFFFF" }}
              aria-label="Send comment"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13" />
                <path d="M22 2 15 22 11 13 2 9 22 2Z" />
              </svg>
            </button>
          </form>
        ) : (
          <div className="text-center py-2">
            <p
              className="text-sm mb-2"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif', color: colors.muted }}
            >
              Join the conversation
            </p>
            <Link
              href="/login"
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif', color: colors.rose }}
            >
              Sign in to share &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
