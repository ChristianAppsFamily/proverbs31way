import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import "@/styles/sunday-journal.css";
import {
  ARCHIVE_DAYS,
  EDITIONS,
  editionByIso,
  verseParts,
} from "./sampleData";
import type {
  DayKey,
  FeedFilter,
  Post,
  PostKind,
  PreviewMode,
} from "./types";

function clonePosts(posts: Post[]): Post[] {
  return posts.map((p) => ({
    ...p,
    replies: p.replies.map((r) => ({ ...r })),
  }));
}

export default function SundayJournalPage() {
  const { date } = useParams<{ date?: string }>();
  const navigate = useNavigate();

  const initialEdition = editionByIso(date);
  const [dayKey, setDayKey] = useState<DayKey>(initialEdition.key);
  const [mode, setMode] = useState<PreviewMode>("member");
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [postKind, setPostKind] = useState<PostKind>("reflection");
  const [posts, setPosts] = useState<Post[]>(() =>
    clonePosts(initialEdition.posts),
  );
  const [reacted, setReacted] = useState<Set<number>>(() => new Set());
  const [openReplies, setOpenReplies] = useState<Set<number>>(() => new Set());
  const [composeText, setComposeText] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [signMessage, setSignMessage] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const archiveRef = useRef<HTMLDialogElement>(null);
  const signRef = useRef<HTMLDialogElement>(null);
  const rulesRef = useRef<HTMLDialogElement>(null);
  const reportRef = useRef<HTMLDialogElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const composeId = useId();
  const emailId = useId();
  const reportReasonId = useId();

  const edition = EDITIONS[dayKey];
  const isToday = dayKey === "today";
  const isPast = !isToday;
  const verse = verseParts(edition);

  const announce = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    const next = editionByIso(date);
    setDayKey(next.key);
    setPosts(clonePosts(next.posts));
    setFilter("all");
    setMoreOpen(false);
    setReacted(new Set());
    setOpenReplies(new Set());
    setComposeText("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [date]);

  const loadDay = (key: DayKey) => {
    const next = EDITIONS[key];
    if (key === "today") {
      navigate("/today");
    } else {
      navigate(`/readings/${next.dateIso}`);
    }
  };

  const openSignIn = () => {
    setSignMessage(null);
    signRef.current?.showModal();
  };

  const rootClass = [
    "sunday-journal",
    mode === "guest" ? "guest" : "",
    isPast ? "past" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const visiblePosts = posts.filter(
    (p) => filter === "all" || p.kind === filter,
  );

  const handleCompose = (e: FormEvent) => {
    e.preventDefault();
    if (mode !== "member" || !isToday) return;
    const value = composeText.trim();
    if (!value) return;
    setPosts((prev) => [
      {
        id: Date.now(),
        initials: "TW",
        name: "You",
        time: "Just now",
        kind: postKind,
        text: value,
        count: 0,
        replies: [],
        pending: true,
      },
      ...prev,
    ]);
    setComposeText("");
    setFilter("all");
    announce("Saved to the review queue · demo only");
  };

  const toggleReact = (id: number) => {
    if (mode === "guest") {
      openSignIn();
      return;
    }
    if (!isToday) {
      announce("Past day is read-only");
      return;
    }
    setReacted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleReplies = (id: number) => {
    setOpenReplies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submitReply = (postId: number, text: string) => {
    if (mode !== "member") {
      openSignIn();
      return;
    }
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              replies: [
                ...p.replies,
                { name: "You", time: "Awaiting approval", text },
              ],
            }
          : p,
      ),
    );
    announce("Reply saved to review queue · demo only");
  };

  const previewActive =
    isPast ? "past" : mode === "guest" ? "guest" : "member";

  return (
    <div className={rootClass}>
      <a className="skip" href="#sj-main">
        Skip to today's word
      </a>

      <header className="site-header">
        <Link
          className="brand"
          to="/today"
          aria-label="The Way home"
          onClick={(e) => {
            if (!isToday) {
              e.preventDefault();
              loadDay("today");
            }
          }}
        >
          <span className="brand-name">
            the <em>way.</em>
          </span>
          <span className="brand-meta">
            A daily
            <br />
            gathering
          </span>
        </Link>
        <div className="header-message">
          a quiet place to meet in the Word. together.
        </div>
        <nav className="header-actions" aria-label="Main navigation">
          <button
            className="text-nav"
            type="button"
            onClick={() => archiveRef.current?.showModal()}
          >
            Past days
          </button>
          <button
            className="member-avatar"
            type="button"
            title={mode === "guest" ? "Join The Way" : "Your member view"}
            aria-label={mode === "guest" ? "Join The Way" : "Member profile"}
            onClick={() => {
              if (mode === "guest") openSignIn();
              else announce("This is the signed-in member preview");
            }}
          >
            {mode === "guest" ? "JOIN" : "TW"}
          </button>
        </nav>
      </header>

      <main id="sj-main" className="page-shell">
        <div className="edition-line">
          <span>{edition.dayLabel}</span>
          <span className="mini-cross" aria-hidden="true">
            —
          </span>
          <span>
            <strong>{isToday ? "Today’s reading" : "Past reading"}</strong>
            &nbsp; / &nbsp; A shared moment
          </span>
        </div>

        <article
          className="feature"
          aria-label="Daily Scripture and devotional"
        >
          <section className="word-panel" aria-labelledby="sj-word-heading">
            <div className="panel-kicker quiet-label">
              <span id="sj-word-heading">01 &nbsp; / &nbsp; The Word</span>
              <span>{edition.translation}</span>
            </div>
            <blockquote className="verse">
              {verse.before}
              <em>{verse.em}</em>
              {verse.after}
            </blockquote>
            <div className="word-foot">
              <span className="quiet-label">{edition.reference}</span>
              <div className="foot-rule" />
              <span className="quiet-label">Take a breath</span>
            </div>
          </section>

          <section
            className="devotion-panel"
            aria-labelledby="sj-devotion-heading"
          >
            <div className="devotion-top quiet-label">
              <span>02 &nbsp; / &nbsp; Today's Devotional</span>
              <span>2 min read</span>
            </div>
            <h1 id="sj-devotion-heading" className="devotion-title">
              {edition.titleLines[0]}
              <br />
              {edition.titleLines[1]}
            </h1>
            <div className="devotion-byline">A reflection from The Way</div>
            <div className="devotion-copy">
              {edition.paras.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
              {moreOpen ? (
                <div className="more-copy">
                  {edition.more.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              className="subtle-button"
              type="button"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((v) => !v)}
            >
              {moreOpen ? "Show less  −" : "Continue reading  +"}
            </button>
            <div className="question-block">
              <span className="quiet-label" style={{ color: "var(--rose)" }}>
                A question to carry
              </span>
              <p>{edition.question}</p>
            </div>
          </section>
        </article>

        <div className="bridge">
          <p>Read together. Walk together.</p>
          <a href="#sj-community">
            Join today's conversation <span aria-hidden="true">↘</span>
          </a>
        </div>

        <section
          className="community"
          id="sj-community"
          aria-labelledby="sj-community-heading"
        >
          <div className="section-head">
            <div>
              <span className="quiet-label section-num">
                03 &nbsp; / &nbsp; The Gathering
              </span>
              <h2 className="community-title" id="sj-community-heading">
                What’s on your heart?
              </h2>
              <p className="community-subtitle">
                A place to reflect, ask for prayer, and encourage one another.
                <br />
                Every voice is public. Every response begins with kindness.
              </p>
            </div>
          </div>

          <form className="composition" onSubmit={handleCompose}>
            <div className="compose-head">
              <h3 className="compose-h">Add your voice to today’s reading.</h3>
              <span className="compose-explainer">
                Visible to our community after review
              </span>
            </div>
            <label className="sr-only" htmlFor={composeId}>
              Your reflection or prayer request
            </label>
            <textarea
              id={composeId}
              className="compose-input"
              placeholder={
                postKind === "prayer"
                  ? "How can we pray with you today?"
                  : "What did today's word stir in you?"
              }
              maxLength={240}
              required
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
            />
            <div className="compose-footer">
              <div
                className="choice-set"
                role="group"
                aria-label="Type of response"
              >
                <button
                  className={postKind === "reflection" ? "active" : undefined}
                  type="button"
                  aria-pressed={postKind === "reflection"}
                  onClick={() => setPostKind("reflection")}
                >
                  Reflection
                </button>
                <button
                  className={postKind === "prayer" ? "active" : undefined}
                  type="button"
                  aria-pressed={postKind === "prayer"}
                  onClick={() => setPostKind("prayer")}
                >
                  Prayer request
                </button>
              </div>
              <div className="compose-submit-row">
                <span className="count">
                  {composeText.length} / 240
                </span>
                <button className="publish" type="submit">
                  Post response <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
            <p className="meta-fine">
              Only share what you're comfortable making public.{" "}
              <button
                type="button"
                onClick={() => rulesRef.current?.showModal()}
              >
                Community guidelines
              </button>
            </p>
          </form>

          <div className="guest-gate">
            <h3>A seat at the table is waiting.</h3>
            <p>
              Read every reflection and prayer request for free. Join with your
              email when you feel ready to respond.
            </p>
            <button className="publish" type="button" onClick={openSignIn}>
              Join to respond <span aria-hidden="true">↗</span>
            </button>
          </div>

          <div className="archive-notice">
            You're reading a past day. The conversation is preserved here;
            posting happens with today's reading.
          </div>

          <div className="feed-head">
            <h3 className="feed-title">
              {isToday ? "Today’s conversation" : "From this day"}{" "}
              <span className="feed-count">
                {String(posts.length).padStart(2, "0")}
              </span>
            </h3>
            <span className="quiet-label" style={{ color: "var(--muted)" }}>
              Public & thoughtful
            </span>
          </div>

          <div className="feed-filter">
            <div
              className="filter-buttons"
              role="group"
              aria-label="Filter responses"
            >
              {(
                [
                  ["all", "All"],
                  ["reflection", "Reflections"],
                  ["prayer", "Prayer requests"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  data-filter={value}
                  className={filter === value ? "active" : undefined}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="sort-label">Newest first</span>
          </div>

          <div aria-live="polite">
            {visiblePosts.length === 0 ? (
              <p className="empty-feed">Be the first to respond today.</p>
            ) : (
              visiblePosts.map((post) => {
                const repliesOpen = openReplies.has(post.id);
                const action =
                  post.kind === "prayer" ? "I’m praying" : "Amen";
                const count =
                  post.count + (reacted.has(post.id) ? 1 : 0);
                const replyLabel = post.replies.length
                  ? `View ${post.replies.length} ${
                      post.replies.length === 1 ? "reply" : "replies"
                    }`
                  : "Reply";

                return (
                  <article className="post" key={post.id}>
                    <div className="avatar" aria-hidden="true">
                      {post.initials}
                    </div>
                    <div>
                      <div className="post-head">
                        <span className="post-name">
                          {post.name}
                          {post.founder ? (
                            <span className="founding">Founding sister</span>
                          ) : null}
                        </span>
                        <span className="post-time">{post.time}</span>
                      </div>
                      {post.pending ? (
                        <span className="post-kind">
                          Awaiting approval — visible to you only
                        </span>
                      ) : (
                        <span className="post-kind">
                          {post.kind === "prayer"
                            ? "Prayer request"
                            : "Reflection"}
                        </span>
                      )}
                      <p className="post-body">{post.text}</p>
                      <div className="post-actions">
                        {post.pending ? (
                          <span className="meta-fine">
                            Your response will appear after moderator approval.
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              className={
                                reacted.has(post.id) ? "is-on" : undefined
                              }
                              aria-pressed={reacted.has(post.id)}
                              onClick={() => toggleReact(post.id)}
                            >
                              {action} &nbsp; {count}
                            </button>
                            <span className="dot">·</span>
                            <button
                              type="button"
                              onClick={() => toggleReplies(post.id)}
                            >
                              {repliesOpen ? "Hide replies" : replyLabel}
                            </button>
                            <span className="dot">·</span>
                            <button
                              type="button"
                              aria-label={`Report ${post.name} response`}
                              onClick={() => reportRef.current?.showModal()}
                            >
                              Report
                            </button>
                          </>
                        )}
                      </div>
                      {!post.pending && repliesOpen ? (
                        <div className="reply-area">
                          {post.replies.map((r, idx) => (
                            <div className="reply" key={`${post.id}-r-${idx}`}>
                              <span className="reply-author">{r.name}</span>
                              <span className="reply-time">{r.time}</span>
                              <p>{r.text}</p>
                            </div>
                          ))}
                          {isToday && mode === "member" ? (
                            <ReplyForm
                              postId={post.id}
                              onSubmit={submitReply}
                            />
                          ) : isToday ? (
                            <p className="meta-fine">
                              Join to offer a public reply.
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">
            the <em>way.</em>
          </div>
          <div>
            <span className="quiet-label" style={{ color: "#f2dfe7" }}>
              ONE WORD. ONE DAY. ONE COMMUNITY.
            </span>
            <p>
              A gentle daily rhythm of Scripture, reflection, and public prayer.
              Come as you are; leave a little less alone.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 The Way &nbsp; · &nbsp; Design concept</span>
          <span>
            <button
              type="button"
              onClick={() => rulesRef.current?.showModal()}
            >
              Our community promise
            </button>
            &nbsp; &nbsp; No private messaging
          </span>
        </div>
      </footer>

      <dialog
        ref={archiveRef}
        aria-labelledby="sj-archive-title"
        onClick={(e) => {
          if (e.target === archiveRef.current) archiveRef.current.close();
        }}
      >
        <div className="dialog-inner">
          <div className="dialog-header">
            <div>
              <span className="quiet-label" style={{ color: "var(--rose)" }}>
                Your reading library
              </span>
              <h3 id="sj-archive-title">Past days.</h3>
            </div>
            <button
              className="dialog-close"
              aria-label="Close"
              type="button"
              onClick={() => archiveRef.current?.close()}
            >
              ×
            </button>
          </div>
          <p className="dialog-text">
            One shared reading for each day. Return to any earlier word;
            archived conversations are read-only.
          </p>
          <div>
            {ARCHIVE_DAYS.map((day) => (
              <button
                key={day.key}
                className="archive-day"
                type="button"
                onClick={() => {
                  archiveRef.current?.close();
                  loadDay(day.key);
                }}
              >
                <span>
                  <small>{day.archiveLabel}</small>
                  <b>{day.archiveTitle}</b>
                </span>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </div>
      </dialog>

      <dialog
        ref={signRef}
        aria-labelledby="sj-sign-title"
        onClick={(e) => {
          if (e.target === signRef.current) signRef.current.close();
        }}
      >
        <div className="dialog-inner">
          <div className="dialog-header">
            <div>
              <span className="quiet-label" style={{ color: "var(--rose)" }}>
                Join the gathering
              </span>
              <h3 id="sj-sign-title">Come as you are.</h3>
            </div>
            <button
              className="dialog-close"
              aria-label="Close"
              type="button"
              onClick={() => signRef.current?.close()}
            >
              ×
            </button>
          </div>
          <p className="dialog-text">
            One email. No passwords to remember. No inboxes or direct messages.
            Only our daily reading and a public place to respond.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSignMessage(
                "Prototype only: no email has been sent. Production will use a real magic-link service.",
              );
            }}
          >
            <label className="quiet-label" htmlFor={emailId}>
              Email address
            </label>
            <input
              className="modal-field"
              id={emailId}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <button className="publish" style={{ width: "100%" }} type="submit">
              Continue with email &nbsp; ↗
            </button>
          </form>
          {signMessage ? (
            <p className="dialog-message" aria-live="polite">
              {signMessage}
            </p>
          ) : null}
        </div>
      </dialog>

      <dialog
        ref={rulesRef}
        aria-labelledby="sj-rules-title"
        onClick={(e) => {
          if (e.target === rulesRef.current) rulesRef.current.close();
        }}
      >
        <div className="dialog-inner">
          <div className="dialog-header">
            <div>
              <span className="quiet-label" style={{ color: "var(--rose)" }}>
                The Way community
              </span>
              <h3 id="sj-rules-title">A kind place.</h3>
            </div>
            <button
              className="dialog-close"
              aria-label="Close"
              type="button"
              onClick={() => rulesRef.current?.close()}
            >
              ×
            </button>
          </div>
          <p className="dialog-text">
            The conversation is public. To care for the women who gather here, we
            keep the boundaries simple.
          </p>
          <ul className="guidelines">
            <li>
              Encourage others; disagree respectfully without targeting people.
            </li>
            <li>
              Avoid sharing addresses, full names, phone numbers, medical
              records, or identifying details in prayer requests.
            </li>
            <li>
              No solicitation, fundraising requests, external contact
              invitations, or private messaging.
            </li>
            <li>
              New posts can be held for approval; reports are reviewed by
              moderators.
            </li>
          </ul>
        </div>
      </dialog>

      <dialog
        ref={reportRef}
        aria-labelledby="sj-report-title"
        onClick={(e) => {
          if (e.target === reportRef.current) reportRef.current.close();
        }}
      >
        <div className="dialog-inner">
          <div className="dialog-header">
            <div>
              <span className="quiet-label" style={{ color: "var(--rose)" }}>
                Keep our space safe
              </span>
              <h3 id="sj-report-title">Report a response.</h3>
            </div>
            <button
              className="dialog-close"
              aria-label="Close"
              type="button"
              onClick={() => reportRef.current?.close()}
            >
              ×
            </button>
          </div>
          <p className="dialog-text">
            Reports go to a moderator for review. Choose the closest reason.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              reportRef.current?.close();
              announce(
                "Report recorded in this preview · no backend connected",
              );
            }}
          >
            <label htmlFor={reportReasonId} className="quiet-label">
              Reason
            </label>
            <select
              id={reportReasonId}
              required
              style={{
                width: "100%",
                padding: "14px 6px",
                margin: "14px 0 24px",
                border: "1px solid var(--line)",
                background: "var(--white)",
              }}
              defaultValue="spam"
            >
              <option value="spam">Spam or solicitation</option>
              <option value="personal">
                Private or identifying information
              </option>
              <option value="harassment">Unkind or harassing content</option>
              <option value="other">Something else</option>
            </select>
            <button className="publish" style={{ width: "100%" }} type="submit">
              Submit report
            </button>
          </form>
        </div>
      </dialog>

      <details
        className="preview-switch"
        open={previewOpen}
        onToggle={(e) =>
          setPreviewOpen((e.target as HTMLDetailsElement).open)
        }
      >
        <summary>Design preview · change view</summary>
        <div className="preview-buttons">
          {(
            [
              ["member", "Member"],
              ["guest", "Visitor"],
              ["past", "Past day"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={previewActive === value ? "active" : undefined}
              onClick={() => {
                if (value === "past") {
                  setMode("member");
                  loadDay("yesterday");
                } else {
                  if (!isToday) loadDay("today");
                  setMode(value);
                }
                setPreviewOpen(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <p>
          These controls are for reviewing the concept, not part of the final
          website.
        </p>
      </details>

      <div id="toast" role="status" hidden={!toast}>
        {toast}
      </div>
    </div>
  );
}

function ReplyForm({
  postId,
  onSubmit,
}: {
  postId: number;
  onSubmit: (postId: number, text: string) => void;
}) {
  const [text, setText] = useState("");
  const id = useId();

  return (
    <form
      className="reply-field"
      onSubmit={(e) => {
        e.preventDefault();
        const value = text.trim();
        if (!value) return;
        onSubmit(postId, value);
        setText("");
      }}
    >
      <label className="sr-only" htmlFor={id}>
        Your public reply
      </label>
      <textarea
        id={id}
        maxLength={240}
        required
        placeholder="Offer a word of encouragement…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="reply-helper">
        <span>Public reply · 240 characters max</span>
        <button type="submit">Post reply</button>
      </div>
    </form>
  );
}
