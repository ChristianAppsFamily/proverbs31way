import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { formatRelativeTime, todayIso } from "./dates";
import type { ArchiveDay, Edition, Post, PostKind, Profile } from "./types";

type EditionRow = {
  id: string;
  date_iso: string;
  day_label: string;
  reference: string;
  translation: string;
  verse_before: string;
  verse_em: string;
  verse_after: string;
  title_line_1: string;
  title_line_2: string;
  question: string;
  paras: unknown;
  more: unknown;
  archive_label: string;
  archive_title: string;
};

type ProfileRow = {
  id: string;
  display_name: string;
  initials: string;
  is_founder: boolean;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function mapEdition(row: EditionRow): Edition {
  return {
    id: row.id,
    dateIso: row.date_iso,
    dayLabel: row.day_label,
    reference: row.reference,
    translation: row.translation,
    verseBefore: row.verse_before ?? "",
    verseEm: row.verse_em,
    verseAfter: row.verse_after ?? "",
    titleLines: [row.title_line_1, row.title_line_2],
    question: row.question,
    paras: asStringArray(row.paras),
    more: asStringArray(row.more),
    archiveLabel: row.archive_label,
    archiveTitle: row.archive_title,
  };
}

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    initials: row.initials,
    isFounder: row.is_founder,
  };
}

export async function ensureProfile(): Promise<Profile> {
  const { data, error } = await supabaseBrowser.rpc("ensure_profile");
  if (error) throw error;
  return mapProfile(data as ProfileRow);
}

export async function fetchEditionByDate(
  dateIso: string | undefined,
): Promise<Edition | null> {
  const target = dateIso ?? todayIso();
  const { data, error } = await supabaseBrowser
    .from("editions")
    .select(
      "id, date_iso, day_label, reference, translation, verse_before, verse_em, verse_after, title_line_1, title_line_2, question, paras, more, archive_label, archive_title",
    )
    .eq("date_iso", target)
    .not("published_at", "is", null)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapEdition(data as EditionRow);
}

export async function fetchArchiveDays(limit = 30): Promise<ArchiveDay[]> {
  const { data, error } = await supabaseBrowser
    .from("editions")
    .select("date_iso, archive_label, archive_title")
    .not("published_at", "is", null)
    .order("date_iso", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    dateIso: row.date_iso as string,
    archiveLabel: row.archive_label as string,
    archiveTitle: row.archive_title as string,
  }));
}

export async function fetchGatheringPosts(
  editionId: string,
  viewerId: string | null,
): Promise<Post[]> {
  const { data: postRows, error: postsError } = await supabaseBrowser
    .from("posts")
    .select(
      "id, kind, body, created_at, author:profiles!posts_author_id_fkey ( display_name, initials, is_founder )",
    )
    .eq("edition_id", editionId)
    .order("created_at", { ascending: false });

  if (postsError) throw postsError;
  if (!postRows?.length) return [];

  const postIds = postRows.map((p) => p.id as string);

  const [{ data: replyRows, error: repliesError }, { data: reactionRows, error: reactionsError }] =
    await Promise.all([
      supabaseBrowser
        .from("post_replies")
        .select(
          "id, post_id, body, created_at, author:profiles!post_replies_author_id_fkey ( display_name )",
        )
        .in("post_id", postIds)
        .order("created_at", { ascending: true }),
      supabaseBrowser
        .from("post_reactions")
        .select("post_id, user_id")
        .in("post_id", postIds),
    ]);

  if (repliesError) throw repliesError;
  if (reactionsError) throw reactionsError;

  const repliesByPost = new Map<string, Post["replies"]>();
  for (const reply of replyRows ?? []) {
    const postId = reply.post_id as string;
    const authorRaw = reply.author as
      | { display_name?: string }
      | { display_name?: string }[]
      | null;
    const author = Array.isArray(authorRaw) ? authorRaw[0] : authorRaw;
    const list = repliesByPost.get(postId) ?? [];
    list.push({
      id: reply.id as string,
      name: author?.display_name ?? "Sister",
      time: formatRelativeTime(reply.created_at as string),
      text: reply.body as string,
    });
    repliesByPost.set(postId, list);
  }

  const countByPost = new Map<string, number>();
  const reacted = new Set<string>();
  for (const reaction of reactionRows ?? []) {
    const postId = reaction.post_id as string;
    countByPost.set(postId, (countByPost.get(postId) ?? 0) + 1);
    if (viewerId && reaction.user_id === viewerId) reacted.add(postId);
  }

  return postRows.map((row) => {
    const authorRaw = row.author as
      | {
          display_name?: string;
          initials?: string;
          is_founder?: boolean;
        }
      | {
          display_name?: string;
          initials?: string;
          is_founder?: boolean;
        }[]
      | null;
    const author = Array.isArray(authorRaw) ? authorRaw[0] : authorRaw;
    const id = row.id as string;
    return {
      id,
      initials: author?.initials ?? "TW",
      name: author?.display_name ?? "Sister",
      time: formatRelativeTime(row.created_at as string),
      kind: row.kind as PostKind,
      text: row.body as string,
      count: countByPost.get(id) ?? 0,
      reactedByMe: reacted.has(id),
      replies: repliesByPost.get(id) ?? [],
      founder: Boolean(author?.is_founder),
    };
  });
}

export async function createPost(input: {
  editionId: string;
  authorId: string;
  kind: PostKind;
  body: string;
}): Promise<void> {
  const { error } = await supabaseBrowser.from("posts").insert({
    edition_id: input.editionId,
    author_id: input.authorId,
    kind: input.kind,
    body: input.body,
  });
  if (error) throw error;
}

export async function createReply(input: {
  postId: string;
  authorId: string;
  body: string;
}): Promise<void> {
  const { error } = await supabaseBrowser.from("post_replies").insert({
    post_id: input.postId,
    author_id: input.authorId,
    body: input.body,
  });
  if (error) throw error;
}

export async function toggleReaction(input: {
  postId: string;
  userId: string;
  currentlyReacted: boolean;
}): Promise<void> {
  if (input.currentlyReacted) {
    const { error } = await supabaseBrowser
      .from("post_reactions")
      .delete()
      .eq("post_id", input.postId)
      .eq("user_id", input.userId);
    if (error) throw error;
    return;
  }

  const { error } = await supabaseBrowser.from("post_reactions").insert({
    post_id: input.postId,
    user_id: input.userId,
  });
  if (error) throw error;
}

export async function createReport(input: {
  reporterId: string;
  postId: string;
  reason: string;
}): Promise<void> {
  const { error } = await supabaseBrowser.from("reports").insert({
    reporter_id: input.reporterId,
    post_id: input.postId,
    reply_id: null,
    reason: input.reason,
  });
  if (error) throw error;
}

export async function requestMagicLink(email: string): Promise<void> {
  const redirectTo = `${window.location.origin}/`;
  const { error } = await supabaseBrowser.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true,
    },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await supabaseBrowser.auth.signOut();
  if (error) throw error;
}
