import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const db = new PrismaClient();

const hebrewPoems = [
  {
    title: "To the Bird",
    titleHe: "אל הציפור",
    author: "Haim Nahman Bialik",
    authorHe: "חיים נחמן ביאליק",
    content: "Welcome, welcome, lovely bird,\nFrom warm lands far away!\nHow good to hear your voice again,\nReturning with the May.",
    contentHe: `הֲשָׁלוֹם לָךְ, צִפּוֹרָה נֶחְמָדָה,
מֵאַרְצוֹת הַחֹם הָרְחוֹקוֹת!
מַה נָּעִים לִשְׁמֹעַ קוֹלֵךְ שׁוּב,
הַשָּׁבָה עִם הָאָבִיב.

הֲסַפֵּרִי לִי, צִפּוֹרָה חֲבִיבָה,
עַל אֶרֶץ חָמָה וּרְחוֹקָה,
הֲגַם שָׁם דְּמָעוֹת וַאֲנָחוֹת,
הֲגַם שָׁם צָרוֹת רַבּוֹת?

וּמָה שְׁלוֹם אַחַי עוֹבְדֵי הָאֲדָמָה,
הַעֲמֵלִים בְּזֵעַת אַפַּיִם?
הַאִם עוֹד יֵשׁ תִּקְוָה בַּלֵּב,
לְיָמִים טוֹבִים וְנֶאֱמָנִים?`,
    language: "HE" as const,
    themes: ["longing", "homeland", "nature", "hope"],
    year: 1892,
    isPublicDomain: true,
  },
  {
    title: "After My Death",
    titleHe: "אחרי מותי",
    author: "Haim Nahman Bialik",
    authorHe: "חיים נחמן ביאליק",
    content: "After my death mourn me this way:\nThere was a man — and look: he is no more.\nBefore his time this man died.\nThe music of his life suddenly stopped.",
    contentHe: `אַחֲרֵי מוֹתִי קִינוּ עָלַי כָּכָה:
הָיָה אִישׁ — וּרְאוּ: אֵינֶנּוּ עוֹד.
בְּטֶרֶם עִתּוֹ מֵת הָאִישׁ הַזֶּה,
וְשִׁיר חַיָּיו בַּאֲמַצַע נִפְסָק.

חֲבָל! עוֹד שִׁיר אֶחָד הָיָה לוֹ —
וְהִנֵּה אָבַד הַשִּׁיר לָעַד,
אָבַד לָעַד!

וְעוֹד לוֹ כִּנּוֹר אֶחָד חַי,
כִּנּוֹר חַי — שֶׁבּוֹ מְיַתְּרָיו
כֻּלָּם אִלְּמוּ,
וְאַף הוּא, הַכִּנּוֹר, מֵעַתָּה יִדֹּם.`,
    language: "HE" as const,
    themes: ["death", "loss", "poetry", "legacy"],
    year: 1904,
    isPublicDomain: true,
  },
  {
    title: "Only of Myself I Knew How to Tell",
    titleHe: "רק על עצמי לספר ידעתי",
    author: "Rachel",
    authorHe: "רחל",
    content: "Only of myself I knew how to tell,\nMy world is narrow as that of an ant.\nI too carried my heavy load,\nToo great for my thin shoulder.",
    contentHe: `רַק עַל עַצְמִי לְסַפֵּר יָדַעְתִּי.
צַר עוֹלָמִי כְּעוֹלַם נְמָלָה,
גַּם אֲנִי נָשָׂאתִי מַשָּׂאִי
רַב וְכָבֵד עַל כָּתֵף צְנֻמָּה.

גַּם אֲנִי דַּרְכִּי — דֶּרֶךְ הַנְּמָלָה —
הָיְתָה דֶּרֶךְ יִסּוּרִים,
דֶּרֶךְ יָד חֲרוּצָה, עַד רַעַד,
וְגַם דֶּרֶךְ וִתּוּרִים.`,
    language: "HE" as const,
    themes: ["self", "humility", "struggle", "poetry"],
    year: 1927,
    isPublicDomain: true,
  },
  {
    title: "Perhaps",
    titleHe: "אולי",
    author: "Rachel",
    authorHe: "רחל",
    content: "Perhaps these things never happened,\nPerhaps I never rose at dawn\nTo till the garden with my sweat,\nIn the long burning days of harvest.",
    contentHe: `אוּלַי לֹא הָיוּ הַדְּבָרִים מֵעוֹלָם,
אוּלַי מֵעוֹלָם לֹא קַמְתִּי בַּשַּׁחַר
לָעֲבֹד אֶת הַגַּן בְּזֵעַת אַפַּי,

אוּלַי מֵעוֹלָם לֹא רָאִיתִי אוֹתְךָ
בַּיָּמִים הָאֲרֻכִּים הַלּוֹהֲטִים שֶׁל הַקָּצִיר
עַל שְׁבִיל שְׁטוּפַת אוֹר וְעָמֹס.`,
    language: "HE" as const,
    themes: ["memory", "doubt", "landscape", "love"],
    year: 1927,
    isPublicDomain: true,
  },
  {
    title: "God Has Pity on Kindergarten Children",
    titleHe: "אלוהים מרחם על ילדי הגן",
    author: "Yehuda Amichai",
    authorHe: "יהודה עמיחי",
    content: "God has pity on kindergarten children.\nHe has less pity on school children.\nAnd on grownups he has no pity at all.",
    contentHe: `אֱלֹהִים מְרַחֵם עַל יַלְדֵי הַגַּן,
פָּחוֹת מִזֶּה עַל יַלְדֵי בֵּית הַסֵּפֶר.
וְעַל הַגְּדוֹלִים לֹא יְרַחֵם עוֹד,

יַשְׁאִיר אוֹתָם לְבַדָּם,
וְלִפְעָמִים יִצְטָרְכוּ לִזְחֹל עַל אַרְבַּע
בַּחוֹל הַלּוֹהֵט,
כְּדֵי לְהַגִּיעַ אֶל תַּחֲנַת הַתְּחָנָה,

וְהֵם שְׁטוּפֵי דָּם וְיוֹדְעִים,
בְּחַכְמָתָם הַגְּדוֹלָה,
שֶׁלֹּא לִבְכּוֹת.`,
    language: "HE" as const,
    themes: ["compassion", "innocence", "adulthood", "war"],
    year: 1955,
    isPublicDomain: false,
  },
  {
    title: "A Man in His Life",
    titleHe: "אדם בחייו",
    author: "Yehuda Amichai",
    authorHe: "יהודה עמיחי",
    content: "A man doesn't have time in his life\nto have time for everything.\nHe doesn't have seasons enough to have\na season for every purpose.",
    contentHe: `אָדָם בְּחַיָּיו אֵין לוֹ זְמָן
לְהִיוֹת לוֹ זְמָן לַכֹּל.
אֵין לוֹ עוֹנוֹת מַסְפִּיקוֹת
לִהְיוֹת לוֹ עוֹנָה לְכָל מַטָּרָה.

אֵין לוֹ אֶלָּא לֶאֱהֹב וּלְשָׂנֹא
לְהַאֲמִין וּלְכַפֵּר,
לִשְׂמֹחַ וְלִבְכּוֹת,
לִזְכֹּר וְלִשְׁכֹּחַ,
לְסַדֵּר וְלָשׁוּב לְסַדֵּר,
וְלֶאֱסֹף אֶבֶן מֵעַל הָאֶבֶן
שֶׁהִשְׁלִיכוּ כְּנֶגֶד
בְּיַלְדוּתוֹ הָרְחוֹקָה.`,
    language: "HE" as const,
    themes: ["time", "life", "mortality", "purpose"],
    year: 1989,
    isPublicDomain: false,
  },
  {
    title: "From My Mother's Home",
    titleHe: "מבית אמי",
    author: "Leah Goldberg",
    authorHe: "לאה גולדברג",
    content: "My mother's mother died in the spring of her days.\nAnd her daughter did not remember her face.\nHer portrait, engraved in my grandfather's heart,\nWas struck from the world of images.",
    contentHe: `אֵם אִמִּי מֵתָה בִּרְבִיעַ יָמֶיהָ,
וּבִתָּהּ לֹא זָכְרָה אֶת פָּנֶיהָ.
דְּמוּתָהּ, הַחֲקוּקָה בְּלֵב סָבִי,
נִמְחֲקָה מֵעוֹלָם הַתְּמוּנוֹת.

רַק שְׁנֵי סִפְרֵי תְּפִלָּה
עִבְרִיִּים כְּתֻמִּים,
שֶׁנֶּהֶגוּ בַּדְּפוּסִים הַיְשָׁנִים
שֶׁל אַמְשְׂטֶרְדָּם,
הֵבִיאָה הַסָּבְתָא הַזֹּאת
כְּנָדוּנְיָה לְבֵית בַּעְלָהּ.`,
    language: "HE" as const,
    themes: ["memory", "family", "loss", "heritage"],
    year: 1942,
    isPublicDomain: true,
  },
  {
    title: "Pine",
    titleHe: "אורן",
    author: "Leah Goldberg",
    authorHe: "לאה גולדברג",
    content: "Here I will not hear the voice of the cuckoo.\nHere the tree will not wear a turban of snow.\nBut in the shadow of these pines\nmy whole childhood stands alive.",
    contentHe: `כָּאן לֹא אֶשְׁמַע אֶת קוֹל הַקּוּקִיָּה.
כָּאן לֹא יַחְבֹּשׁ הָעֵץ מִצְנֶפֶת שֶׁלֶג,
אֲבָל בְּצֵל הָאֳרָנִים הָאֵלֶּה
כָּל יַלְדוּתִי שָׁבָה וּמוֹפִיעָה.

צִלְצוּל הַמְּחָטִים: הָיוּ פַּעַם —
אֶקְרָא נוֹף מוֹלֶדֶת,
אֶקְרָא: יַלְדוּת, חֶסֶד,
כְּמוֹ מַרְאוֹת שֶׁל הַכָּתוּב
בָּאַלְבּוֹם הַמִּשְׁפָּחָה.`,
    language: "HE" as const,
    themes: ["homeland", "childhood", "nature", "nostalgia"],
    year: 1954,
    isPublicDomain: true,
  },
  {
    title: "Stars Outside",
    titleHe: "כוכבים בחוץ",
    author: "Nathan Alterman",
    authorHe: "נתן אלתרמן",
    content: "The stars outside are cold and distant.\nThe night wind blows and does not rest.\nBut within the warmth of this small room\nA candle burns against the dark.",
    contentHe: `הַכּוֹכָבִים בַּחוּץ קָרִים וּרְחוֹקִים.
רוּחַ הַלַּיְלָה נוֹשֶׁבֶת וְלֹא תָּנוּחַ.
אֲבָל בְּתוֹךְ חֲמִימוּת הַחֶדֶר הַקָּטָן
נֵר דּוֹלֵק מוּל הַחֲשֵׁכָה.

הַחַלּוֹן בּוֹכֶה טִפּוֹת שֶׁל גֶּשֶׁם,
וְהַמֵּדוּרָה הָאַחֲרוֹנָה נִכְבֵּית,
אֲבָל אַתָּה כָּאן, וְזֶה מַסְפִּיק,
כְּמוֹ לֶחֶם, כְּמוֹ מַיִם, כְּמוֹ שָׁנָה שָׁלֵמָה.`,
    language: "HE" as const,
    themes: ["night", "warmth", "love", "solitude"],
    year: 1938,
    isPublicDomain: true,
  },
  {
    title: "Summer Night",
    titleHe: "ליל קיץ",
    author: "Nathan Alterman",
    authorHe: "נתן אלתרמן",
    content: "A summer night in the fields,\nThe smell of oranges on the wind.\nFootsteps of a boy and a girl,\nGoing, not knowing where.",
    contentHe: `לֵיל קַיִץ בַּשָּׂדוֹת,
רֵיחַ תַּפּוּזִים עַל הָרוּחַ.
צְעָדֵי נַעַר וְנַעֲרָה,
הוֹלְכִים, לֹא יוֹדְעִים לְאָן.

הַיָּרֵחַ עוֹלֶה מֵעַל הַפַּרְדֵּס,
הַצְּרָצְרִים שָׁרִים כְּמוֹ מִקְהֵלָה,
וְהַלַּיְלָה הַזֶּה לֹא יָשׁוּב,
וְהַלַּיְלָה הַזֶּה הוּא הַכֹּל.`,
    language: "HE" as const,
    themes: ["youth", "love", "summer", "fleeting"],
    year: 1944,
    isPublicDomain: true,
  },
  {
    title: "Wild Peace",
    titleHe: "שלום פרא",
    author: "Yehuda Amichai",
    authorHe: "יהודה עמיחי",
    content: "Not the peace of a cease-fire,\nNot even the vision of the wolf and the lamb,\nBut rather as in the heart when the excitement is over\nAnd you can talk only about a great weariness.",
    contentHe: `לֹא שְׁלוֹם הַפְסָקַת אֵשׁ,
וְלֹא אֲפִלּוּ חֲזוֹן הַזְּאֵב עִם הַכֶּבֶשׂ,
אֶלָּא כָּמוֹ שֶׁבַּלֵּב, כְּשֶׁגָּמַר הָרֶגֶשׁ
וְאַתָּה יָכוֹל לְדַבֵּר רַק עַל עֲיֵפוּת גְּדוֹלָה.

אֲנִי יוֹדֵעַ שֶׁהַמִּלְחָמָה הָרְחוֹקָה
אֵינָהּ שְׁלָאְךָ,
וְאַחֲרֶיהָ אַתָּה תִּשְׁכַּח הַכֹּל
כְּמוֹ שֶׁשּׁוֹכְחִים שֵׁם אַכְסָנְיָה
שֶׁשָּׁהִיתָ בָּהּ בַּלַּיְלָה.`,
    language: "HE" as const,
    themes: ["peace", "war", "exhaustion", "forgetting"],
    year: 1971,
    isPublicDomain: false,
  },
  {
    title: "My Heart Is in the East",
    titleHe: "לבי במזרח",
    author: "Yehuda HaLevi",
    authorHe: "יהודה הלוי",
    content: "My heart is in the east, and I am at the edge of the west.\nHow can I taste what I eat, how can I enjoy?\nHow can I fulfill my vows and obligations,\nWhile Zion is in the domain of Edom, and I am in the bonds of Arabia?",
    contentHe: `לִבִּי בְמִזְרָח וְאָנֹכִי בְּסוֹף מַעֲרָב —
אֵיךְ אֶטְעֲמָה אֵת אֲשֶׁר אֹכַל וְאֵיךְ יֶעֱרָב?
אֵיכָה אֲשַׁלֵּם נְדָרַי וָאֱסָרַי,
בְּעוֹד צִיּוֹן בְּחֶבֶל אֱדוֹם וַאֲנִי בְּכֶבֶל עֲרָב?

יֵקַל בְּעֵינַי עֲזֹב כָּל טוּב סְפָרַד, כְּמוֹ
יֵקַר בְּעֵינַי רְאוֹת עַפְרוֹת דְּבִיר נֶחֱרָב.`,
    language: "HE" as const,
    themes: ["exile", "longing", "homeland", "faith"],
    year: 1140,
    isPublicDomain: true,
  },
  {
    title: "The Silver Platter",
    titleHe: "מגש הכסף",
    author: "Nathan Alterman",
    authorHe: "נתן אלתרמן",
    content: "The earth will grow still, the blood-red eye of sky\nWill slowly dim above the smoking borders.\nAnd the nation will rise, torn at heart but still alive,\nTo receive the one and only miracle.",
    contentHe: `וְהָאָרֶץ תִּשְׁקֹט, עַיִן הַשָּׁמַיִם
הָאֲדֻמָּה תֶּחְשַׁךְ לְאַט
עַל גְּבוּלוֹת עֲשֵׁנִים.
וְאֻמָּה תַּעֲמֹד — קְרוּעַת לֵב אַךְ נוֹשֶׁמֶת —
לְקַבֵּל אֶת הַנֵּס,
הָאֶחָד שֶׁאֵין לוֹ שֵׁנִי.

הִיא לַטֶּקֶס תִּכּוֹן. הִיא תָקוּם לְמוּל הַיָּרֵחַ
וְעָמְדָה, עֲטוּפַת חָג וָאֵימָה.
— אָז מִנֶּגֶד יֵצְאוּ נַעֲרָה וְנַעַר
וְיִצְעֲדוּ לְאַט לִקְרַאת הָאֻמָּה.`,
    language: "HE" as const,
    themes: ["sacrifice", "nation", "independence", "youth"],
    year: 1947,
    isPublicDomain: true,
  },
  {
    title: "Jerusalem",
    titleHe: "ירושלים",
    author: "Yehuda Amichai",
    authorHe: "יהודה עמיחי",
    content: "On a roof in the Old City\nlaundry hanging in the late afternoon sunlight:\nthe white sheet of a woman who is my enemy,\nthe towel of a man who is my enemy.",
    contentHe: `עַל גַּג בָּעִיר הָעַתִּיקָה
כְּבִיסָה תְּלוּיָה בְּאוֹר אַחֲרוֹן שֶׁל צָהֳרַיִם:
הַסָּדִין הַלָּבָן שֶׁל אִשָּׁה שֶׁהִיא אוֹיְבָתִי,
הַמַּגֶּבֶת שֶׁל אִישׁ שֶׁהוּא אוֹיְבִי,

כְּדֵי לְנַגֵּב בָּהּ אֶת הַזֵּעָה שֶׁל מִצְחוֹ.

וּבַשָּׁמַיִם שֶׁל הָעִיר הָעַתִּיקָה
עֲפִיפוֹן.
בַּקָּצֶה שֶׁל חוּט — יֶלֶד
שֶׁאֵינִי רוֹאֶה
בִּגְלַל הַחוֹמָה.`,
    language: "HE" as const,
    themes: ["Jerusalem", "conflict", "humanity", "coexistence"],
    year: 1967,
    isPublicDomain: false,
  },
  {
    title: "With This Night",
    titleHe: "עם הלילה הזה",
    author: "Leah Goldberg",
    authorHe: "לאה גולדברג",
    content: "With this night and its darkness,\nWith the rain and the storm,\nWith the cry of the wind in the window,\nI am alone.",
    contentHe: `עִם הַלַּיְלָה הַזֶּה וְחֶשְׁכּוֹ,
עִם הַגֶּשֶׁם וְהַסְּעָרָה,
עִם צְעָקַת הָרוּחַ בַּחַלּוֹן,
אֲנִי לְבַדִּי.

אֲבָל לֹא לְבַד בְּמוּבָן הָעָצוּב,
לֹא כְּמוֹ שֶׁחוֹשְׁבִים,
אֶלָּא לְבַדִּי עִם הַמִּלִּים,
עִם הַשִּׁירָה, עִם הַחַיִּים.`,
    language: "HE" as const,
    themes: ["solitude", "night", "poetry", "resilience"],
    year: 1948,
    isPublicDomain: true,
  },
  {
    title: "Kinneret",
    titleHe: "כנרת",
    author: "Rachel",
    authorHe: "רחל",
    content: "Do you remember? — or have you forgotten? —\nthe evening light on the waters' face.\nA hushed miracle, a burning sky,\nand the silence... the silence of grace.",
    contentHe: `הַזּוֹכֵר? — אוֹ שָׁכַחְתָּ? —
אוֹר עֶרֶב עַל פְּנֵי הַמַּיִם.
נֵס דּוּמָם, שָׁמַיִם בּוֹעֲרִים,
וּדְמָמָה... דְּמָמָה שֶׁל חֶסֶד.

הַזּוֹכֵר? עָמַדְנוּ שְׁנֵינוּ יַחַד
אֶל מוּל הַכִּנֶּרֶת,
וְלֹא הָיוּ מִלִּים,
כִּי הַדְּמָמָה הָיְתָה שְׁלֵמָה.`,
    language: "HE" as const,
    themes: ["memory", "landscape", "love", "silence"],
    year: 1930,
    isPublicDomain: true,
  },
];

async function main() {
  console.log("Seeding Hebrew poems...");

  for (const poem of hebrewPoems) {
    const existing = await db.poem.findFirst({
      where: {
        title: poem.title,
        author: poem.author,
      },
    });

    if (existing) {
      console.log(`  Skipping "${poem.title}" (already exists)`);
      continue;
    }

    const created = await db.poem.create({
      data: {
        title: poem.title,
        titleHe: poem.titleHe,
        author: poem.author,
        authorHe: poem.authorHe,
        content: poem.content,
        contentHe: poem.contentHe,
        language: poem.language,
        source: "FOUND",
        themes: poem.themes,
        year: poem.year,
        isPublicDomain: poem.isPublicDomain,
      },
    });

    // Create a published PoemFeature so it shows on the homepage
    const baseSlug = slugify(poem.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'\"!:@]/g,
    });
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    await db.poemFeature.create({
      data: {
        poemId: created.id,
        slug,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    console.log(`  Seeded: "${poem.title}" by ${poem.author}`);
  }

  console.log(`Done! Seeded ${hebrewPoems.length} poems.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
