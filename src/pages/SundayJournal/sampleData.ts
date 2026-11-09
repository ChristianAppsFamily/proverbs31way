import type { Edition, Post } from "./types";

const todayPosts: Post[] = [
  {
    id: 1,
    initials: "MC",
    name: "Marissa C.",
    time: "36 min ago",
    kind: "prayer",
    text: "Please pray for my family as we navigate a hard conversation this week. I'm asking God for patience, tender hearts, and the right words.",
    count: 24,
    replies: [
      {
        name: "Ruth A.",
        time: "18 min ago",
        text: "Praying that peace meets each of you before the conversation even begins.",
      },
      {
        name: "Elena R.",
        time: "7 min ago",
        text: "Holding your family in prayer today.",
      },
    ],
  },
  {
    id: 2,
    initials: "ER",
    name: "Elena R.",
    time: "2 hours ago",
    kind: "reflection",
    text: "I needed this reminder. I keep treating rest as something I have to earn. Today I'm choosing to pause before trying to fix what I cannot control.",
    count: 18,
    founder: true,
    replies: [
      {
        name: "Joanna M.",
        time: "1 hour ago",
        text: "“Rest as something I have to earn.” This put words to what I've been feeling, too.",
      },
    ],
  },
  {
    id: 3,
    initials: "JM",
    name: "Joanna M.",
    time: "4 hours ago",
    kind: "reflection",
    text: "For me, being still looks like leaving my phone on the table, opening my Bible, and letting five quiet minutes be enough. Small beginnings matter.",
    count: 12,
    replies: [],
  },
];

export const EDITIONS: Record<string, Edition> = {
  today: {
    key: "today",
    dateIso: "2026-11-08",
    dayLabel: "Sunday, November 8, 2026",
    reference: "Psalm 46:10",
    translation: "KJV · Excerpt",
    verseLead: "Be still,",
    verseRest: " and know that I am God.",
    titleLines: ["The courage", "to be still."],
    question: "What is one thing you can place in God's hands today?",
    paras: [
      "There is a kind of quiet that does not come naturally. It asks us to set down the things we are trying to hold together and remember that we were never meant to carry everything alone.",
      "Stillness is not the absence of responsibility. It is the presence of trust. Today, before you move to the next thing, you are invited to make room for both.",
    ],
    more: [
      "Perhaps there is an answer you are waiting for, a relationship that feels unsettled, or a weight you cannot explain to anyone else. God is not asking you to solve it all before you come close. He meets you in the middle of it.",
      "Take a moment to breathe. Name what is heavy. Offer it in prayer, without first trying to make it sound beautiful or brave. Let this be enough for today: you can be held while the story is still unfolding.",
    ],
    archiveLabel: "Today · Sunday, November 8",
    archiveTitle: "Be still and know",
    posts: todayPosts,
  },
  yesterday: {
    key: "yesterday",
    dateIso: "2026-11-07",
    dayLabel: "Saturday, November 7, 2026",
    reference: "Lamentations 3:23",
    translation: "KJV · Excerpt",
    verseLead: "new every morning:",
    verseRest: "",
    titleLines: ["The mercy of", "beginning again."],
    question: "Where do you need to receive a fresh beginning?",
    paras: [
      "There is grace for the day you did not expect. We are not asked to arrive at morning with everything already in order.",
      "God's faithfulness meets us in the ordinary moments, when we begin again with a little courage and a willing heart.",
    ],
    more: [
      "Look for the quiet kindness tucked into this new day. Let it remind you that yesterday does not get the last word.",
    ],
    archiveLabel: "Saturday, November 7",
    archiveTitle: "Mercy every morning",
    posts: [
      {
        id: 11,
        initials: "SH",
        name: "Sarah H.",
        time: "Yesterday",
        kind: "reflection",
        text: "A new beginning was exactly what I needed to hear this morning.",
        count: 9,
        replies: [],
      },
    ],
  },
  friday: {
    key: "friday",
    dateIso: "2026-11-06",
    dayLabel: "Friday, November 6, 2026",
    reference: "Romans 12:12",
    translation: "KJV · Excerpt",
    verseLead: "patient in tribulation;",
    verseRest: "",
    titleLines: ["Hope for the", "in-between."],
    question: "What small hope can you choose to notice today?",
    paras: [
      "Hope need not arrive as certainty. Sometimes it is simply the decision to keep our hearts open when the answer is taking longer than we wished.",
      "When you are living in the in-between, prayer can become a place to set down the burden of perfect understanding.",
    ],
    more: [
      "May patience be gentler than you expected, and may you discover small mercies along the way.",
    ],
    archiveLabel: "Friday, November 6",
    archiveTitle: "Hope for the in-between",
    posts: [
      {
        id: 12,
        initials: "MR",
        name: "Maya R.",
        time: "Friday",
        kind: "prayer",
        text: "Praying for hope for everyone living through a long season of waiting.",
        count: 16,
        replies: [],
      },
    ],
  },
};

/** Full verse text with emphasis for yesterday/friday that wrap mid-phrase differently */
export function verseParts(edition: Edition): { before: string; em: string; after: string } {
  if (edition.key === "today") {
    return { before: "", em: edition.verseLead, after: edition.verseRest };
  }
  if (edition.key === "yesterday") {
    return {
      before: "They are ",
      em: "new every morning:",
      after: " great is thy faithfulness.",
    };
  }
  return {
    before: "Rejoicing in hope; ",
    em: "patient in tribulation;",
    after: " continuing instant in prayer.",
  };
}

export function editionByIso(dateIso: string | undefined): Edition {
  if (!dateIso) return EDITIONS.today;
  const match = Object.values(EDITIONS).find((e) => e.dateIso === dateIso);
  return match ?? EDITIONS.today;
}

export function editionKeyFromIso(dateIso: string | undefined): keyof typeof EDITIONS {
  const edition = editionByIso(dateIso);
  return edition.key;
}

export const ARCHIVE_DAYS = [
  EDITIONS.today,
  EDITIONS.yesterday,
  EDITIONS.friday,
] as const;
