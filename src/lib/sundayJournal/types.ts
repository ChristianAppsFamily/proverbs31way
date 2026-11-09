export type PostKind = "reflection" | "prayer";
export type FeedFilter = "all" | "reflection" | "prayer";

export type Profile = {
  id: string;
  displayName: string;
  initials: string;
  isFounder: boolean;
};

export type Edition = {
  id: string;
  dateIso: string;
  dayLabel: string;
  reference: string;
  translation: string;
  verseBefore: string;
  verseEm: string;
  verseAfter: string;
  titleLines: [string, string];
  question: string;
  paras: string[];
  more: string[];
  archiveLabel: string;
  archiveTitle: string;
};

export type Reply = {
  id: string;
  name: string;
  time: string;
  text: string;
};

export type Post = {
  id: string;
  initials: string;
  name: string;
  time: string;
  kind: PostKind;
  text: string;
  count: number;
  reactedByMe: boolean;
  replies: Reply[];
  founder?: boolean;
};

export type ArchiveDay = {
  dateIso: string;
  archiveLabel: string;
  archiveTitle: string;
};
