import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { FormEvent, RefObject } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import "@/styles/sunday-journal.css";
import {
  createPost,
  createReply,
  createReport,
  deleteAccount,
  fetchArchiveDays,
  fetchEditionByDate,
  fetchGatheringPosts,
  requestSignInCode,
  signOut,
  toggleReaction,
  verifySignInCode,
} from "@/lib/sundayJournal/api";
import { isIsoDate, todayIso } from "@/lib/sundayJournal/dates";
import type {
  ArchiveDay,
  Edition,
  FeedFilter,
  Post,
  PostKind,
} from "@/lib/sundayJournal/types";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";

export default function SundayJournalPage() {
  const { date } = useParams<{ date?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();

  const requestedDate = date && isIsoDate(date) ? date : undefined;
  const isTodayRoute = !requestedDate;
  const calendarToday = todayIso();

  const [edition, setEdition] = useState<Edition | null>(null);
  const [editionMissing, setEditionMissing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingEdition, setLoadingEdition] = useState(true);
  const [archiveDays, setArchiveDays] = useState<ArchiveDay[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [postKind, setPostKind] = useState<PostKind>("reflection");
  const [composeText, setComposeText] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [openReplies, setOpenReplies] = useState<Set<string>>(() => new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [signMessage, setSignMessage] = useState<string | null>(null);
  const [signBusy, setSignBusy] = useState(false);
  const [signEmail, setSignEmail] = useState("");
  const [signStep, setSignStep] = useState<"email" | "code">("email");
  const [authIntent, setAuthIntent] = useState<"signup" | "signin">("signin");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [enterOverlay, setEnterOverlay] = useState<{
    phase: "in" | "hold" | "out";
    message: string;
  } | null>(null);
  const codeId = useId();
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  const [busyPostId, setBusyPostId] = useState<string | null>(null);

  const archiveRef = useRef<HTMLDialogElement>(null);
  const signRef = useRef<HTMLDialogElement>(null);
  const rulesRef = useRef<HTMLDialogElement>(null);
  const reportRef = useRef<HTMLDialogElement>(null);
  const settingsRef = useRef<HTMLDialogElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const composeId = useId();
  const emailId = useId();
  const reportReasonId = useId();

  const isMember = Boolean(user && profile);
  const editionDate = edition?.dateIso ?? requestedDate ?? calendarToday;
  const isToday = editionDate === calendarToday;
  const isPast = Boolean(edition && !isToday);

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

  const reloadGathering = useCallback(
    async (editionId: string) => {
      const next = await fetchGatheringPosts(editionId, user?.id ?? null);
      setPosts(next);
    },
    [user?.id],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingEdition(true);
      setLoadError(null);
      setEditionMissing(false);
      setFilter("all");
      setMoreOpen(false);
      setOpenReplies(new Set());
      setComposeText("");

      try {
        if (date && !isIsoDate(date)) {
          if (!cancelled) {
            setEdition(null);
            setPosts([]);
            setEditionMissing(true);
          }
          return;
        }

        const [nextEdition, archive] = await Promise.all([
          fetchEditionByDate(requestedDate),
          fetchArchiveDays(),
        ]);

        if (cancelled) return;

        setArchiveDays(archive);

        if (!nextEdition) {
          setEdition(null);
          setPosts([]);
          setEditionMissing(true);
          return;
        }

        setEdition(nextEdition);
        await reloadGathering(nextEdition.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Could not load today’s reading.",
          );
          setEdition(null);
          setPosts([]);
        }
      } finally {
        if (!cancelled) setLoadingEdition(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [date, requestedDate, reloadGathering]);

  const openSignIn = (intent: "signup" | "signin" = "signin") => {
    setAuthIntent(intent);
    setSignMessage(null);
    setSignStep("email");
    setSignEmail("");
    signRef.current?.showModal();
  };

  const openSettings = () => {
    settingsRef.current?.showModal();
  };

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth !== "signup" && auth !== "signin") return;
    if (authLoading) return;
    if (isMember) {
      setSearchParams({}, { replace: true });
      return;
    }
    openSignIn(auth);
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams, authLoading, isMember]);

  const openReport = (postId: string) => {
    if (!isMember) {
      openSignIn();
      return;
    }
    setReportPostId(postId);
    reportRef.current?.showModal();
  };

  const rootClass = [
    "sunday-journal",
    !isMember ? "guest" : "",
    isPast ? "past" : "",
    enterOverlay ? "is-entering" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const rootProps = {
    className: rootClass,
    "data-theme": theme,
  };

  const visiblePosts = posts.filter(
    (p) => filter === "all" || p.kind === filter,
  );

  const handleCompose = async (e: FormEvent) => {
    e.preventDefault();
    if (!isMember || !profile || !edition || !isToday) return;
    const value = composeText.trim();
    if (!value) return;

    try {
      await createPost({
        editionId: edition.id,
        authorId: profile.id,
        kind: postKind,
        body: value,
      });
      setComposeText("");
      setFilter("all");
      await reloadGathering(edition.id);
      announce("Your response is live.");
    } catch (err) {
      console.error(err);
      announce(
        err instanceof Error ? err.message : "Could not post. Please try again.",
      );
    }
  };

  const handleToggleReact = async (post: Post) => {
    if (!isMember || !profile) {
      openSignIn();
      return;
    }
    if (!isToday) {
      announce("Past day is read-only.");
      return;
    }
    if (busyPostId === post.id) return;
    setBusyPostId(post.id);
    try {
      await toggleReaction({
        postId: post.id,
        userId: profile.id,
        currentlyReacted: post.reactedByMe,
      });
      await reloadGathering(edition!.id);
    } catch (err) {
      console.error(err);
      announce(
        err instanceof Error ? err.message : "Could not save your response.",
      );
    } finally {
      setBusyPostId(null);
    }
  };

  const toggleReplies = (id: string) => {
    setOpenReplies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submitReply = async (postId: string, text: string) => {
    if (!isMember || !profile) {
      openSignIn();
      return;
    }
    if (!edition || !isToday) return;
    try {
      await createReply({
        postId,
        authorId: profile.id,
        body: text,
      });
      await reloadGathering(edition.id);
      announce("Reply posted.");
    } catch (err) {
      console.error(err);
      announce(
        err instanceof Error ? err.message : "Could not post reply.",
      );
    }
  };

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setSignBusy(true);
    setSignMessage(null);
    try {
      if (signStep === "email") {
        const email = String(data.get("email") ?? "").trim();
        if (!email) return;
        await requestSignInCode(email);
        setSignEmail(email);
        setSignStep("code");
        setSignMessage(
          "We sent a 6-digit code to your email. Enter it below to join.",
        );
      } else {
        const token = String(data.get("code") ?? "").trim();
        if (!token) return;
        await verifySignInCode(signEmail, token);
        signRef.current?.close();
        setSignStep("email");
        setSignMessage(null);
        const message =
          authIntent === "signup"
            ? "Welcome home."
            : "The gathering is waiting.";
        setEnterOverlay({ phase: "in", message });
        window.setTimeout(() => {
          setEnterOverlay((prev) =>
            prev ? { ...prev, phase: "hold" } : prev,
          );
        }, 80);
        window.setTimeout(() => {
          setEnterOverlay((prev) =>
            prev ? { ...prev, phase: "out" } : prev,
          );
          document
            .getElementById("sj-community")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 1600);
        window.setTimeout(() => {
          setEnterOverlay(null);
          announce(
            authIntent === "signup"
              ? "You’re in. Add your voice when you’re ready."
              : "Welcome back.",
          );
        }, 3200);
      }
    } catch (err) {
      console.error(err);
      setSignMessage(
        err instanceof Error
          ? err.message
          : "Could not complete sign-in. Please try again.",
      );
    } finally {
      setSignBusy(false);
    }
  };

  const handleAvatarClick = () => {
    if (!isMember) {
      openSignIn("signin");
      return;
    }
    openSettings();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      settingsRef.current?.close();
      announce("Signed out.");
    } catch (err) {
      console.error(err);
      announce("Could not sign out.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your account permanently? Your posts and replies will be removed. This cannot be undone.",
    );
    if (!confirmed) return;
    setDeleteBusy(true);
    try {
      await deleteAccount();
      settingsRef.current?.close();
      announce("Your account has been deleted.");
      navigate("/");
    } catch (err) {
      console.error(err);
      announce(
        err instanceof Error ? err.message : "Could not delete account.",
      );
    } finally {
      setDeleteBusy(false);
    }
  };

  const goToDay = (dateIso: string) => {
    if (dateIso === calendarToday) navigate("/today");
    else navigate(`/readings/${dateIso}`);
  };

  if (loadingEdition || authLoading) {
    return (
      <div className="sunday-journal" data-theme={theme}>
        <main className="page-shell" style={{ paddingTop: "6rem" }}>
          <p className="community-subtitle">Loading today’s gathering…</p>
        </main>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="sunday-journal" data-theme={theme}>
        <main className="page-shell" style={{ paddingTop: "6rem" }}>
          <h1 className="devotion-title">Something went wrong.</h1>
          <p className="community-subtitle">{loadError}</p>
          <button
            className="publish"
            type="button"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </main>
      </div>
    );
  }

  if (editionMissing || !edition) {
    return (
      <div className="sunday-journal" data-theme={theme}>
        <header className="site-header">
          <Link className="brand" to="/today" aria-label="The Way home">
            <span className="brand-name">
              the <em>way.</em>
            </span>
            <span className="brand-meta">
              A daily
              <br />
              gathering
            </span>
          </Link>
        </header>
        <main className="page-shell" style={{ paddingTop: "4rem" }}>
          <h1 className="devotion-title">
            {isTodayRoute ? "Today’s reading is not up yet." : "Reading not found."}
          </h1>
          <p className="community-subtitle" style={{ maxWidth: "32rem" }}>
            {isTodayRoute
              ? "Check back soon, or browse a past day if one is available."
              : "That date does not have a published reading."}
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {!isTodayRoute ? (
              <button className="publish" type="button" onClick={() => navigate("/today")}>
                Go to today
              </button>
            ) : null}
            {archiveDays.length > 0 ? (
              <button
                className="subtle-button"
                type="button"
                onClick={() => archiveRef.current?.showModal()}
              >
                Past days
              </button>
            ) : null}
          </div>
        </main>
        <ArchiveDialog
          dialogRef={archiveRef}
          days={archiveDays}
          onSelect={(dateIso) => {
            archiveRef.current?.close();
            goToDay(dateIso);
          }}
        />
      </div>
    );
  }

  return (
    <div {...rootProps}>
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
              navigate("/today");
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
          {!isMember ? (
            <>
              <button
                className="text-nav"
                type="button"
                onClick={() => openSignIn("signin")}
              >
                Sign in
              </button>
              <button
                className="member-avatar"
                type="button"
                title="Sign up"
                aria-label="Sign up"
                onClick={() => openSignIn("signup")}
              >
                JOIN
              </button>
            </>
          ) : (
            <button
              className="member-avatar"
              type="button"
              title="Settings"
              aria-label="Open settings"
              onClick={handleAvatarClick}
            >
              {profile?.initials ?? "TW"}
            </button>
          )}
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
              {edition.verseBefore}
              <em>{edition.verseEm}</em>
              {edition.verseAfter}
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
            {edition.more.length > 0 ? (
              <button
                className="subtle-button"
                type="button"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((v) => !v)}
              >
                {moreOpen ? "Show less  −" : "Continue reading  +"}
              </button>
            ) : null}
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

          <form className="composition" onSubmit={(e) => void handleCompose(e)}>
            <div className="compose-head">
              <h3 className="compose-h">Add your voice to today’s reading.</h3>
              <span className="compose-explainer">
                Visible to our community right away
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
                <span className="count">{composeText.length} / 240</span>
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
            <div className="guest-gate-actions">
              <button
                className="publish"
                type="button"
                onClick={() => openSignIn("signup")}
              >
                Sign up <span aria-hidden="true">↗</span>
              </button>
              <button
                className="subtle-button"
                type="button"
                onClick={() => openSignIn("signin")}
              >
                Already a member? Sign in
              </button>
            </div>
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
                      <span className="post-kind">
                        {post.kind === "prayer"
                          ? "Prayer request"
                          : "Reflection"}
                      </span>
                      <p className="post-body">{post.text}</p>
                      <div className="post-actions">
                        <button
                          type="button"
                          className={post.reactedByMe ? "is-on" : undefined}
                          aria-pressed={post.reactedByMe}
                          disabled={busyPostId === post.id}
                          onClick={() => void handleToggleReact(post)}
                        >
                          {action} &nbsp; {post.count}
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
                          onClick={() => openReport(post.id)}
                        >
                          Report
                        </button>
                      </div>
                      {repliesOpen ? (
                        <div className="reply-area">
                          {post.replies.map((r) => (
                            <div className="reply" key={r.id}>
                              <span className="reply-author">{r.name}</span>
                              <span className="reply-time">{r.time}</span>
                              <p>{r.text}</p>
                            </div>
                          ))}
                          {isToday && isMember ? (
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
            <span className="footer-tagline">
              A HOME FOR THE DAUGHTERS OF GOD
            </span>
            <p>
              A gentle daily rhythm of Scripture, reflection, and public prayer.
              Come as you are; leave a little less alone.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 The Way</span>
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

      <ArchiveDialog
        dialogRef={archiveRef}
        days={archiveDays}
        onSelect={(dateIso) => {
          archiveRef.current?.close();
          goToDay(dateIso);
        }}
      />

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
                {authIntent === "signup" ? "Create your place" : "Welcome back"}
              </span>
              <h3 id="sj-sign-title">
                {authIntent === "signup" ? "Sign up." : "Sign in."}
              </h3>
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
            {signStep === "email"
              ? authIntent === "signup"
                ? "One email. No passwords. Enter today’s gathering and respond with your sisters."
                : "One email. No passwords. We’ll send a code so you can return to the gathering."
              : `Enter the code we sent to ${signEmail}.`}
          </p>
          <form onSubmit={(e) => void handleSignIn(e)}>
            {signStep === "email" ? (
              <>
                <label className="quiet-label" htmlFor={emailId}>
                  Email address
                </label>
                <input
                  className="modal-field"
                  id={emailId}
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </>
            ) : (
              <>
                <label className="quiet-label" htmlFor={codeId}>
                  6-digit code
                </label>
                <input
                  className="modal-field"
                  id={codeId}
                  name="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  maxLength={8}
                  required
                />
              </>
            )}
            <button
              className="publish"
              style={{ width: "100%" }}
              type="submit"
              disabled={signBusy}
            >
              {signBusy
                ? signStep === "email"
                  ? "Sending…"
                  : "Checking…"
                : signStep === "email"
                  ? "Continue with email  ↗"
                  : authIntent === "signup"
                    ? "Enter the gathering  ↗"
                    : "Sign in  ↗"}
            </button>
          </form>
          {signStep === "email" ? (
            <p className="meta-fine" style={{ marginTop: "14px" }}>
              {authIntent === "signup" ? (
                <button type="button" onClick={() => setAuthIntent("signin")}>
                  Already have an account? Sign in
                </button>
              ) : (
                <button type="button" onClick={() => setAuthIntent("signup")}>
                  New here? Sign up
                </button>
              )}
            </p>
          ) : (
            <p className="meta-fine" style={{ marginTop: "14px" }}>
              <button
                type="button"
                onClick={() => {
                  setSignStep("email");
                  setSignMessage(null);
                }}
              >
                Use a different email
              </button>
            </p>
          )}
          {signMessage ? (
            <p className="dialog-message" aria-live="polite">
              {signMessage}
            </p>
          ) : null}
        </div>
      </dialog>

      <dialog
        ref={settingsRef}
        aria-labelledby="sj-settings-title"
        onClick={(e) => {
          if (e.target === settingsRef.current) settingsRef.current.close();
        }}
      >
        <div className="dialog-inner">
          <div className="dialog-header">
            <div>
              <span className="quiet-label" style={{ color: "var(--rose)" }}>
                Your account
              </span>
              <h3 id="sj-settings-title">Settings.</h3>
            </div>
            <button
              className="dialog-close"
              aria-label="Close"
              type="button"
              onClick={() => settingsRef.current?.close()}
            >
              ×
            </button>
          </div>
          <p className="dialog-text">
            Signed in as {profile?.displayName ?? "sister"}
            {user?.email ? ` · ${user.email}` : ""}.
          </p>

          <div className="settings-block">
            <p className="quiet-label" style={{ color: "var(--rose)" }}>
              Appearance
            </p>
            <div className="settings-theme" role="group" aria-label="Theme">
              <button
                type="button"
                className={theme === "light" ? "active" : undefined}
                aria-pressed={theme === "light"}
                onClick={() => setTheme("light")}
              >
                Light
              </button>
              <button
                type="button"
                className={theme === "dark" ? "active" : undefined}
                aria-pressed={theme === "dark"}
                onClick={() => setTheme("dark")}
              >
                Dark
              </button>
            </div>
          </div>

          <div className="settings-block">
            <button
              className="publish"
              type="button"
              style={{ width: "100%" }}
              onClick={() => void handleSignOut()}
            >
              Sign out
            </button>
          </div>

          <div className="settings-block settings-danger">
            <p className="quiet-label">Danger zone</p>
            <p className="dialog-text" style={{ marginBottom: "16px" }}>
              Deleting your account removes your profile and Gathering posts.
              This cannot be undone.
            </p>
            <button
              className="danger-button"
              type="button"
              disabled={deleteBusy}
              onClick={() => void handleDeleteAccount()}
            >
              {deleteBusy ? "Deleting…" : "Delete account"}
            </button>
          </div>
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
              Posts go live right away. Use Report if something needs a closer
              look.
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
            Reports are saved for review. Choose the closest reason.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void (async () => {
                if (!profile || !reportPostId) return;
                const reason = String(
                  new FormData(e.currentTarget).get("reason") ?? "",
                );
                try {
                  await createReport({
                    reporterId: profile.id,
                    postId: reportPostId,
                    reason,
                  });
                  reportRef.current?.close();
                  setReportPostId(null);
                  announce("Thank you. Your report was received.");
                } catch (err) {
                  console.error(err);
                  announce(
                    err instanceof Error
                      ? err.message
                      : "Could not submit report.",
                  );
                }
              })();
            }}
          >
            <label htmlFor={reportReasonId} className="quiet-label">
              Reason
            </label>
            <select
              id={reportReasonId}
              name="reason"
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

      {enterOverlay ? (
        <div
          className={`enter-veil enter-veil--${enterOverlay.phase}`}
          role="status"
          aria-live="polite"
        >
          <p className="enter-veil-kicker">the way.</p>
          <p className="enter-veil-line">{enterOverlay.message}</p>
        </div>
      ) : null}

      <div id="toast" role="status" hidden={!toast}>
        {toast}
      </div>
    </div>
  );
}

function ArchiveDialog({
  dialogRef,
  days,
  onSelect,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  days: ArchiveDay[];
  onSelect: (dateIso: string) => void;
}) {
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="sj-archive-title"
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close();
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
            onClick={() => dialogRef.current?.close()}
          >
            ×
          </button>
        </div>
        <p className="dialog-text">
          One shared reading for each day. Return to any earlier word;
          archived conversations are read-only.
        </p>
        <div>
          {days.length === 0 ? (
            <p className="meta-fine">No past days yet.</p>
          ) : (
            days.map((day) => (
              <button
                key={day.dateIso}
                className="archive-day"
                type="button"
                onClick={() => onSelect(day.dateIso)}
              >
                <span>
                  <small>{day.archiveLabel}</small>
                  <b>{day.archiveTitle}</b>
                </span>
                <span aria-hidden="true">↗</span>
              </button>
            ))
          )}
        </div>
      </div>
    </dialog>
  );
}

function ReplyForm({
  postId,
  onSubmit,
}: {
  postId: string;
  onSubmit: (postId: string, text: string) => void | Promise<void>;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const id = useId();

  return (
    <form
      className="reply-field"
      onSubmit={(e) => {
        e.preventDefault();
        const value = text.trim();
        if (!value || busy) return;
        setBusy(true);
        void Promise.resolve(onSubmit(postId, value))
          .then(() => setText(""))
          .finally(() => setBusy(false));
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
        <button type="submit" disabled={busy}>
          {busy ? "Posting…" : "Post reply"}
        </button>
      </div>
    </form>
  );
}
