export type PreviewMode = "member" | "guest";
export type DayKey = "today" | "yesterday" | "friday";
export type PostKind = "reflection" | "prayer";
export type FeedFilter = "all" | "reflection" | "prayer";

export type Reply = {
  name: string;
  time: string;
  text: string;
};

export type Post = {
  id: number;
  initials: string;
  name: string;
  time: string;
  kind: PostKind;
  text: string;
  count: number;
  replies: Reply[];
  founder?: boolean;
  pending?: boolean;
};

export type Edition = {
  key: DayKey;
  dateIso: string;
  dayLabel: string;
  reference: string;
  translation: string;
  verseLead: string;
  verseRest: string;
  titleLines: [string, string];
  question: string;
  paras: string[];
  more: string[];
  archiveLabel: string;
  archiveTitle: string;
  posts: Post[];
};
