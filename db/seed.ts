import { getDb } from "../api/queries/connection";
import { dailyContent } from "./schema";

async function seed() {
  const db = getDb();

  const now = new Date();
  const content = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    content.push(dateStr);
  }

  const verses = [
    {
      verse: "She is clothed with strength and dignity; she can laugh at the days to come. She speaks with wisdom, and faithful instruction is on her tongue.",
      reference: "Proverbs 31:25-26",
      devotional: "The Proverbs 31 woman is not defined by perfection but by her posture toward life. She faces the future with laughter, not because she controls it, but because she knows who holds it.\n\nThis week, as you move through your days, notice where tension lives in your body. The tight shoulders, the clenched jaw, the shallow breathing. These are invitations to return to dignity, not the stiff, performative kind, but the quiet confidence that comes from knowing you are held.\n\nSpeak wisdom today, even if only to yourself. The words you say in the privacy of your own mind shape the woman you are becoming.",
      reflectionPrompt: "Today, consider: Where in your life are you gripping too tightly? What would it look like to laugh at the days to come?",
    },
    {
      verse: "Let the morning bring me word of your unfailing love, for I have put my trust in you. Show me the way I should go, for to you I entrust my life.",
      reference: "Psalm 143:8",
      devotional: "There is a particular tenderness to morning prayers. The day is still unwritten, the mistakes have not yet been made, and hope sits like dew on untouched grass.\n\nDavid writes this prayer from a cave, a place of hiding, of uncertainty, of transition. And yet his first act is not to plan his escape but to ask for God's word of love.\n\nWhat if your mornings began this way? Not with the inbox, not with the to-do list, not with the news, but with a single breath that says, \"I am yours today.\" The way will be shown. It always is.",
      reflectionPrompt: "Today, consider: What is the first thing your soul reaches for in the morning? How might you reorder that reach?",
    },
    {
      verse: "But blessed is the one who trusts in the Lord, whose confidence is in him. They will be like a tree planted by the water that sends out its roots by the stream.",
      reference: "Jeremiah 17:7-8",
      devotional: "A tree by the water does not panic when heat comes. It does not wilt at the first sign of drought. Its roots have gone deep into something that does not dry up.\n\nThis is what trust looks like in practice, not the absence of heat, but the presence of deep roots. You will face dry seasons. Everyone does. The question is not whether heat will come, but where your roots are drawing from when it does.\n\nPlant yourself today. Read the words that give life. Have the conversation that matters. Sit in silence if that is what your soul needs. The stream is always there.",
      reflectionPrompt: "Today, consider: Where are your roots drawing from right now? Is it a sustainable source?",
    },
    {
      verse: "Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls.",
      reference: "Matthew 11:28-29",
      devotional: "Jesus does not say, \"Come to me when you have it all together.\" He says, \"Come to me when you are weary.\" The invitation is not for the strong but for the worn.\n\nAnd what he offers is not a heavier burden but a shared yoke, his strength alongside your weakness, his gentleness tempering your striving.\n\nYou do not have to carry everything alone today. You were never meant to. The yoke is easy not because the work is light, but because you are not pulling it by yourself.",
      reflectionPrompt: "Today, consider: What burden are you carrying that was never meant to be yours alone?",
    },
    {
      verse: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.",
      reference: "Psalm 23:1-3",
      devotional: "The Psalm does not say, \"The Lord is my shepherd, I have everything I want.\" It says, \"I lack nothing.\" There is a profound difference between wanting and needing, between accumulation and sufficiency.\n\nA shepherd does not drive sheep, he leads them. He knows where the green pastures are because he has been there before. He leads beside quiet waters because he knows that still water refreshes what rushing water cannot.\n\nWhat would it mean to truly believe you lack nothing today? Not as a denial of real needs, but as an anchor in the midst of them.",
      reflectionPrompt: "Today, consider: What do you actually need right now? Separate it from what you merely want.",
    },
    {
      verse: "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.",
      reference: "Ephesians 2:10",
      devotional: "You are not a draft. You are not a rough sketch waiting for the final version. You are God's poiema, his poetry, his masterpiece, his finished work.\n\nThe good works were prepared in advance. This means your purpose is not something you manufacture through hustle. It is something you discover through faithfulness. The very thing you are doing today, if done with love, is part of the work prepared for you.\n\nDo not despise small beginnings or ordinary moments. The masterpiece is not only in the grand gestures. It is in the thousand small choices to love well.",
      reflectionPrompt: "Today, consider: What good work has God prepared for you in this ordinary day?",
    },
    {
      verse: "The joy of the Lord is your strength.",
      reference: "Nehemiah 8:10",
      devotional: "Joy is not the same as happiness. Happiness depends on happenings, on circumstances aligning with our desires. Joy is deeper. It is the settled assurance that God is who he says he is, and that nothing can separate us from his love.\n\nThis joy is not something you manufacture. It is something you receive. It flows from the Lord to you, and then, remarkably, it becomes your strength. Not your backup plan, not your last resort. Your strength.\n\nToday, when you feel your own strength failing, remember: there is a joy available to you that does not depend on your circumstances. It depends only on his presence.",
      reflectionPrompt: "Today, consider: Where can you make room for joy, even in the midst of difficulty?",
    },
  ];

  for (let i = 0; i < 7; i++) {
    await db.insert(dailyContent).values({
      verse: verses[i].verse,
      reference: verses[i].reference,
      devotional: verses[i].devotional,
      reflectionPrompt: verses[i].reflectionPrompt,
      publishDate: content[i],
    });
  }

  console.log("Seeded 7 days of garden content.");
}

seed().catch(console.error);
