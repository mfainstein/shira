export interface RegistryPoem {
  title: string;
  titleHe?: string;
  author: string;
  authorHe?: string;
  language: "EN" | "HE";
  themes: string[];
  searchQuery?: string;
}

export const POEM_REGISTRY: RegistryPoem[] = [
  // ─── Hebrew Poets ───────────────────────────────────────────────

  // Yehuda Amichai (15)
  { title: "God Has Pity on Kindergarten Children", titleHe: "אלוהים מרחם על ילדי הגן", author: "Yehuda Amichai", authorHe: "יהודה עמיחי", language: "HE", themes: ["compassion", "childhood", "faith"] },
  { title: "I Don't Want to Be Consoled", titleHe: "אני לא רוצה שינחמו אותי", author: "Yehuda Amichai", authorHe: "יהודה עמיחי", language: "HE", themes: ["grief", "loss", "defiance"] },
  { title: "A Man in His Life", titleHe: "אדם בחייו", author: "Yehuda Amichai", authorHe: "יהודה עמיחי", language: "HE", themes: ["life", "time", "mortality"] },
  { title: "Jerusalem", titleHe: "ירושלים", author: "Yehuda Amichai", authorHe: "יהודה עמיחי", language: "HE", themes: ["jerusalem", "homeland", "memory"] },
  { title: "The Place Where We Are Right", titleHe: "המקום שבו אנו צודקים", author: "Yehuda Amichai", authorHe: "יהודה עמיחי", language: "HE", themes: ["truth", "doubt", "humility"] },
  { title: "Wild Peace", titleHe: "שלום פרא", author: "Yehuda Amichai", authorHe: "יהודה עמיחי", language: "HE", themes: ["peace", "nature", "hope"] },
  { title: "The Diameter of the Bomb", titleHe: "קוטר הפצצה", author: "Yehuda Amichai", authorHe: "יהודה עמיחי", language: "HE", themes: ["war", "loss", "humanity"] },
  { title: "Tourist", titleHe: "תייר", author: "Yehuda Amichai", authorHe: "יהודה עמיחי", language: "HE", themes: ["identity", "observation", "irony"] },
  { title: "I Wasn't One of the Six Million", titleHe: "אני לא הייתי מששת המיליונים", author: "Yehuda Amichai", authorHe: "יהודה עמיחי", language: "HE", themes: ["holocaust", "survival", "memory"] },
  { title: "My Father's Memorial Day", titleHe: "יום הזיכרון של אבי", author: "Yehuda Amichai", authorHe: "יהודה עמיחי", language: "HE", themes: ["memory", "family", "loss"] },
  { title: "Love Song", titleHe: "שיר אהבה", author: "Yehuda Amichai", authorHe: "יהודה עמיחי", language: "HE", themes: ["love", "longing", "beauty"] },
  { title: "The Real Hero", titleHe: "הגיבור האמיתי", author: "Yehuda Amichai", authorHe: "יהודה עמיחי", language: "HE", themes: ["heroism", "everyday", "humanity"] },
  { title: "Quick and Bitter", titleHe: "מהר וחריף", author: "Yehuda Amichai", authorHe: "יהודה עמיחי", language: "HE", themes: ["love", "brevity", "intensity"] },
  { title: "My Mother Once Told Me", titleHe: "אמי אמרה לי פעם", author: "Yehuda Amichai", authorHe: "יהודה עמיחי", language: "HE", themes: ["family", "memory", "wisdom"] },
  { title: "Travels of the Last Benjamin of Tudela", titleHe: "מסעות בנימין האחרון מטודלה", author: "Yehuda Amichai", authorHe: "יהודה עמיחי", language: "HE", themes: ["journey", "identity", "exile"] },

  // Nathan Alterman (12)
  { title: "Summer Night", titleHe: "לילה של קיץ", author: "Nathan Alterman", authorHe: "נתן אלתרמן", language: "HE", themes: ["night", "summer", "beauty"] },
  { title: "The Silver Platter", titleHe: "מגש הכסף", author: "Nathan Alterman", authorHe: "נתן אלתרמן", language: "HE", themes: ["sacrifice", "independence", "homeland"] },
  { title: "Morning Song", titleHe: "שיר בוקר", author: "Nathan Alterman", authorHe: "נתן אלתרמן", language: "HE", themes: ["morning", "hope", "nature"] },
  { title: "Meeting Without End", titleHe: "פגישה ללא סוף", author: "Nathan Alterman", authorHe: "נתן אלתרמן", language: "HE", themes: ["love", "longing", "eternity"] },
  { title: "Stars Outside", titleHe: "כוכבים בחוץ", author: "Nathan Alterman", authorHe: "נתן אלתרמן", language: "HE", themes: ["night", "stars", "solitude"] },
  { title: "The City of the Dove", titleHe: "עיר היונה", author: "Nathan Alterman", authorHe: "נתן אלתרמן", language: "HE", themes: ["city", "peace", "homeland"] },
  { title: "Joy of the Poor", titleHe: "שמחת עניים", author: "Nathan Alterman", authorHe: "נתן אלתרמן", language: "HE", themes: ["poverty", "joy", "humanity"] },
  { title: "The Spinning Girl", titleHe: "הנערה הטווה", author: "Nathan Alterman", authorHe: "נתן אלתרמן", language: "HE", themes: ["youth", "labor", "beauty"] },
  { title: "Beyond the Melody", titleHe: "מעבר לפזמון", author: "Nathan Alterman", authorHe: "נתן אלתרמן", language: "HE", themes: ["art", "transcendence", "music"] },
  { title: "Eternal Meeting", titleHe: "מפגש נצחי", author: "Nathan Alterman", authorHe: "נתן אלתרמן", language: "HE", themes: ["love", "fate", "eternity"] },
  { title: "The Third Mother", titleHe: "האם השלישית", author: "Nathan Alterman", authorHe: "נתן אלתרמן", language: "HE", themes: ["motherhood", "loss", "war"] },
  { title: "Song to the Wind", titleHe: "שיר לרוח", author: "Nathan Alterman", authorHe: "נתן אלתרמן", language: "HE", themes: ["wind", "freedom", "nature"] },

  // Rachel (10)
  { title: "Perhaps", titleHe: "אולי", author: "Rachel", authorHe: "רחל", language: "HE", themes: ["homeland", "labor", "hope"] },
  { title: "My Country", titleHe: "ארצי", author: "Rachel", authorHe: "רחל", language: "HE", themes: ["homeland", "love", "nature"] },
  { title: "My Dead", titleHe: "מתי", author: "Rachel", authorHe: "רחל", language: "HE", themes: ["death", "memory", "loss"] },
  { title: "From Across", titleHe: "מנגד", author: "Rachel", authorHe: "רחל", language: "HE", themes: ["longing", "distance", "homeland"] },
  { title: "To My Country", titleHe: "לארצי", author: "Rachel", authorHe: "רחל", language: "HE", themes: ["homeland", "devotion", "nature"] },
  { title: "Only About Myself", titleHe: "רק על עצמי", author: "Rachel", authorHe: "רחל", language: "HE", themes: ["self", "modesty", "identity"] },
  { title: "Barren", titleHe: "עקרה", author: "Rachel", authorHe: "רחל", language: "HE", themes: ["longing", "motherhood", "sorrow"] },
  { title: "You Are My White City", titleHe: "את עירי הלבנה", author: "Rachel", authorHe: "רחל", language: "HE", themes: ["city", "love", "beauty"] },
  { title: "Here on the Shores of Kinneret", titleHe: "כאן על פני האדמה", author: "Rachel", authorHe: "רחל", language: "HE", themes: ["nature", "homeland", "peace"] },
  { title: "His Grief", titleHe: "אבלו", author: "Rachel", authorHe: "רחל", language: "HE", themes: ["grief", "love", "loss"] },

  // Leah Goldberg (12)
  { title: "Pine", titleHe: "אורן", author: "Leah Goldberg", authorHe: "לאה גולדברג", language: "HE", themes: ["nature", "exile", "longing"] },
  { title: "From My Mother's Home", titleHe: "מבית אמי", author: "Leah Goldberg", authorHe: "לאה גולדברג", language: "HE", themes: ["memory", "family", "homeland"] },
  { title: "On the Blossoming", titleHe: "על הפריחה", author: "Leah Goldberg", authorHe: "לאה גולדברג", language: "HE", themes: ["spring", "nature", "renewal"] },
  { title: "Toward Myself", titleHe: "אל עצמי", author: "Leah Goldberg", authorHe: "לאה גולדברג", language: "HE", themes: ["self", "identity", "reflection"] },
  { title: "A God Once Commanded Us", titleHe: "אל אחד ציוונו", author: "Leah Goldberg", authorHe: "לאה גולדברג", language: "HE", themes: ["faith", "doubt", "existence"] },
  { title: "Tel Aviv 1935", titleHe: "תל אביב 1935", author: "Leah Goldberg", authorHe: "לאה גולדברג", language: "HE", themes: ["city", "memory", "immigration"] },
  { title: "Will There Yet Come Days", titleHe: "היבואו ימים", author: "Leah Goldberg", authorHe: "לאה גולדברג", language: "HE", themes: ["hope", "future", "peace"] },
  { title: "The Girl Sings to the River", titleHe: "הילדה שרה לנהר", author: "Leah Goldberg", authorHe: "לאה גולדברג", language: "HE", themes: ["youth", "nature", "innocence"] },
  { title: "Last Brightness", titleHe: "הבהירות האחרונה", author: "Leah Goldberg", authorHe: "לאה גולדברג", language: "HE", themes: ["autumn", "time", "beauty"] },
  { title: "Song of the Stream", titleHe: "שיר הנחל", author: "Leah Goldberg", authorHe: "לאה גולדברג", language: "HE", themes: ["water", "nature", "flow"] },
  { title: "Remembrance of a Landscape", titleHe: "זכרון נוף", author: "Leah Goldberg", authorHe: "לאה גולדברג", language: "HE", themes: ["memory", "landscape", "nostalgia"] },
  { title: "Hamsin Days", titleHe: "ימי חמסין", author: "Leah Goldberg", authorHe: "לאה גולדברג", language: "HE", themes: ["heat", "nature", "weariness"] },

  // Bialik (12)
  { title: "After My Death", titleHe: "אחרי מותי", author: "Hayim Nahman Bialik", authorHe: "חיים נחמן ביאליק", language: "HE", themes: ["death", "poetry", "legacy"] },
  { title: "The City of Slaughter", titleHe: "בעיר ההריגה", author: "Hayim Nahman Bialik", authorHe: "חיים נחמן ביאליק", language: "HE", themes: ["violence", "grief", "witness"] },
  { title: "To the Bird", titleHe: "אל הציפור", author: "Hayim Nahman Bialik", authorHe: "חיים נחמן ביאליק", language: "HE", themes: ["homeland", "longing", "nature"] },
  { title: "Alone", titleHe: "לבדי", author: "Hayim Nahman Bialik", authorHe: "חיים נחמן ביאליק", language: "HE", themes: ["solitude", "faith", "identity"] },
  { title: "If You Wish to Know", titleHe: "אם יש את נפשך לדעת", author: "Hayim Nahman Bialik", authorHe: "חיים נחמן ביאליק", language: "HE", themes: ["knowledge", "suffering", "exile"] },
  { title: "The Pool", titleHe: "הברכה", author: "Hayim Nahman Bialik", authorHe: "חיים נחמן ביאליק", language: "HE", themes: ["nature", "stillness", "beauty"] },
  { title: "On the Slaughter", titleHe: "על השחיטה", author: "Hayim Nahman Bialik", authorHe: "חיים נחמן ביאליק", language: "HE", themes: ["violence", "protest", "justice"] },
  { title: "Splendor", titleHe: "הזוהר", author: "Hayim Nahman Bialik", authorHe: "חיים נחמן ביאליק", language: "HE", themes: ["light", "transcendence", "beauty"] },
  { title: "Take Me Under Your Wing", titleHe: "הכניסיני תחת כנפך", author: "Hayim Nahman Bialik", authorHe: "חיים נחמן ביאליק", language: "HE", themes: ["love", "shelter", "tenderness"] },
  { title: "My Song", titleHe: "שירתי", author: "Hayim Nahman Bialik", authorHe: "חיים נחמן ביאליק", language: "HE", themes: ["poetry", "creation", "identity"] },
  { title: "A Twig Fell", titleHe: "נפל ענף", author: "Hayim Nahman Bialik", authorHe: "חיים נחמן ביאליק", language: "HE", themes: ["nature", "loss", "silence"] },
  { title: "Stars Shimmer and Fade", titleHe: "כוכבי שמים", author: "Hayim Nahman Bialik", authorHe: "חיים נחמן ביאליק", language: "HE", themes: ["night", "stars", "wonder"] },

  // Dahlia Ravikovitch (10)
  { title: "Clockwork Doll", titleHe: "בובה ממוכנת", author: "Dahlia Ravikovitch", authorHe: "דליה רביקוביץ'", language: "HE", themes: ["identity", "control", "fragility"] },
  { title: "A Dress of Fire", titleHe: "שמלה של אש", author: "Dahlia Ravikovitch", authorHe: "דליה רביקוביץ'", language: "HE", themes: ["passion", "pain", "beauty"] },
  { title: "Hovering at a Low Altitude", titleHe: "מרחפת בגובה נמוך", author: "Dahlia Ravikovitch", authorHe: "דליה רביקוביץ'", language: "HE", themes: ["witness", "distance", "suffering"] },
  { title: "The Blue West", titleHe: "המערב הכחול", author: "Dahlia Ravikovitch", authorHe: "דליה רביקוביץ'", language: "HE", themes: ["landscape", "longing", "beauty"] },
  { title: "Surely You Remember", titleHe: "בוודאי את זוכרת", author: "Dahlia Ravikovitch", authorHe: "דליה רביקוביץ'", language: "HE", themes: ["memory", "love", "loss"] },
  { title: "Pride", titleHe: "גאווה", author: "Dahlia Ravikovitch", authorHe: "דליה רביקוביץ'", language: "HE", themes: ["pride", "resilience", "nature"] },
  { title: "A Mother Walks Around", titleHe: "אמא מסתובבת", author: "Dahlia Ravikovitch", authorHe: "דליה רביקוביץ'", language: "HE", themes: ["motherhood", "anxiety", "love"] },
  { title: "Hard Winter", titleHe: "חורף קשה", author: "Dahlia Ravikovitch", authorHe: "דליה רביקוביץ'", language: "HE", themes: ["winter", "hardship", "nature"] },
  { title: "Making Peace", titleHe: "להשלים", author: "Dahlia Ravikovitch", authorHe: "דליה רביקוביץ'", language: "HE", themes: ["peace", "acceptance", "time"] },
  { title: "The Sound of Birds at Noon", titleHe: "קול ציפורים בצהריים", author: "Dahlia Ravikovitch", authorHe: "דליה רביקוביץ'", language: "HE", themes: ["nature", "stillness", "beauty"] },

  // Natan Zach (8)
  { title: "When God First Said", titleHe: "כשאלוהים אמר בפעם הראשונה", author: "Natan Zach", authorHe: "נתן זך", language: "HE", themes: ["creation", "faith", "beginning"] },
  { title: "Give Me What the Tree Has", titleHe: "תן לי מה שיש לעץ", author: "Natan Zach", authorHe: "נתן זך", language: "HE", themes: ["nature", "simplicity", "longing"] },
  { title: "Quiet Song", titleHe: "שיר שקט", author: "Natan Zach", authorHe: "נתן זך", language: "HE", themes: ["quiet", "reflection", "peace"] },
  { title: "Perhaps It's Only Music", titleHe: "אולי זו רק מוסיקה", author: "Natan Zach", authorHe: "נתן זך", language: "HE", themes: ["music", "mystery", "beauty"] },
  { title: "A Foreign Country", titleHe: "ארץ זרה", author: "Natan Zach", authorHe: "נתן זך", language: "HE", themes: ["exile", "identity", "alienation"] },
  { title: "Against Parting", titleHe: "נגד הפרידה", author: "Natan Zach", authorHe: "נתן זך", language: "HE", themes: ["parting", "love", "resistance"] },
  { title: "As the Sun Goes Down", titleHe: "כשהשמש שוקעת", author: "Natan Zach", authorHe: "נתן זך", language: "HE", themes: ["sunset", "time", "beauty"] },
  { title: "Listening to Her", titleHe: "מקשיב לה", author: "Natan Zach", authorHe: "נתן זך", language: "HE", themes: ["love", "listening", "tenderness"] },

  // Yona Wallach (8)
  { title: "Absalom", titleHe: "אבשלום", author: "Yona Wallach", authorHe: "יונה וולך", language: "HE", themes: ["rebellion", "identity", "mythology"] },
  { title: "Tefillin", titleHe: "תפילין", author: "Yona Wallach", authorHe: "יונה וולך", language: "HE", themes: ["religion", "gender", "subversion"] },
  { title: "Yonatan", titleHe: "יונתן", author: "Yona Wallach", authorHe: "יונה וולך", language: "HE", themes: ["love", "intimacy", "identity"] },
  { title: "Hebrew", titleHe: "עברית", author: "Yona Wallach", authorHe: "יונה וולך", language: "HE", themes: ["language", "identity", "gender"] },
  { title: "When You Come", titleHe: "כשאתה בא", author: "Yona Wallach", authorHe: "יונה וולך", language: "HE", themes: ["love", "desire", "encounter"] },
  { title: "Two Gardens", titleHe: "שני גנים", author: "Yona Wallach", authorHe: "יונה וולך", language: "HE", themes: ["nature", "duality", "innocence"] },
  { title: "Wild Girl", titleHe: "ילדה פראית", author: "Yona Wallach", authorHe: "יונה וולך", language: "HE", themes: ["freedom", "youth", "rebellion"] },
  { title: "Strawberry", titleHe: "תות", author: "Yona Wallach", authorHe: "יונה וולך", language: "HE", themes: ["desire", "senses", "beauty"] },

  // Meir Wieseltier (6)
  { title: "What a Beautiful Day", titleHe: "מה יום יפה", author: "Meir Wieseltier", authorHe: "מאיר ויזלטיר", language: "HE", themes: ["beauty", "irony", "everyday"] },
  { title: "The Ballad of the Dying Man", titleHe: "בלדה לאיש הגוסס", author: "Meir Wieseltier", authorHe: "מאיר ויזלטיר", language: "HE", themes: ["death", "life", "humanity"] },
  { title: "Abraham", titleHe: "אברהם", author: "Meir Wieseltier", authorHe: "מאיר ויזלטיר", language: "HE", themes: ["faith", "sacrifice", "mythology"] },
  { title: "Song of the Land", titleHe: "שיר הארץ", author: "Meir Wieseltier", authorHe: "מאיר ויזלטיר", language: "HE", themes: ["homeland", "identity", "landscape"] },
  { title: "Take", titleHe: "קח", author: "Meir Wieseltier", authorHe: "מאיר ויזלטיר", language: "HE", themes: ["generosity", "life", "simplicity"] },
  { title: "Suddenly", titleHe: "פתאום", author: "Meir Wieseltier", authorHe: "מאיר ויזלטיר", language: "HE", themes: ["surprise", "change", "moment"] },

  // Yehuda HaLevi (8)
  { title: "My Heart Is in the East", titleHe: "לבי במזרח", author: "Yehuda HaLevi", authorHe: "יהודה הלוי", language: "HE", themes: ["exile", "homeland", "longing"] },
  { title: "Ode to Zion", titleHe: "ציון הלא תשאלי", author: "Yehuda HaLevi", authorHe: "יהודה הלוי", language: "HE", themes: ["jerusalem", "longing", "devotion"] },
  { title: "A Letter", titleHe: "מכתב", author: "Yehuda HaLevi", authorHe: "יהודה הלוי", language: "HE", themes: ["friendship", "distance", "longing"] },
  { title: "Lord, Where Shall I Find You", titleHe: "יה, אנה אמצאך", author: "Yehuda HaLevi", authorHe: "יהודה הלוי", language: "HE", themes: ["faith", "seeking", "devotion"] },
  { title: "The Storm at Sea", titleHe: "הסערה בים", author: "Yehuda HaLevi", authorHe: "יהודה הלוי", language: "HE", themes: ["sea", "danger", "faith"] },
  { title: "When I Went Forth", titleHe: "כשיצאתי", author: "Yehuda HaLevi", authorHe: "יהודה הלוי", language: "HE", themes: ["journey", "exile", "hope"] },
  { title: "My Love, Have You Forgotten", titleHe: "דודי השכחת", author: "Yehuda HaLevi", authorHe: "יהודה הלוי", language: "HE", themes: ["love", "longing", "memory"] },
  { title: "Song for Shabbat", titleHe: "שיר לשבת", author: "Yehuda HaLevi", authorHe: "יהודה הלוי", language: "HE", themes: ["sabbath", "rest", "holiness"] },

  // Tchernichovsky (8)
  { title: "I Believe", titleHe: "אני מאמין", author: "Saul Tchernichovsky", authorHe: "שאול טשרניחובסקי", language: "HE", themes: ["faith", "humanity", "hope"] },
  { title: "Before the Statue of Apollo", titleHe: "לנוכח פסל אפולו", author: "Saul Tchernichovsky", authorHe: "שאול טשרניחובסקי", language: "HE", themes: ["beauty", "paganism", "rebellion"] },
  { title: "Man Is Nothing But", titleHe: "אין האדם אלא", author: "Saul Tchernichovsky", authorHe: "שאול טשרניחובסקי", language: "HE", themes: ["humanity", "nature", "identity"] },
  { title: "Eagle! Eagle!", titleHe: "נשר! נשר!", author: "Saul Tchernichovsky", authorHe: "שאול טשרניחובסקי", language: "HE", themes: ["freedom", "strength", "nature"] },
  { title: "They Say There Is a Land", titleHe: "אומרים ישנה ארץ", author: "Saul Tchernichovsky", authorHe: "שאול טשרניחובסקי", language: "HE", themes: ["homeland", "dream", "hope"] },
  { title: "My Astarte", titleHe: "עשתרות שלי", author: "Saul Tchernichovsky", authorHe: "שאול טשרניחובסקי", language: "HE", themes: ["love", "mythology", "beauty"] },
  { title: "In the Heat of the Day", titleHe: "בחום היום", author: "Saul Tchernichovsky", authorHe: "שאול טשרניחובסקי", language: "HE", themes: ["nature", "labor", "summer"] },
  { title: "On the Blood", titleHe: "על הדם", author: "Saul Tchernichovsky", authorHe: "שאול טשרניחובסקי", language: "HE", themes: ["violence", "protest", "justice"] },

  // David Avidan (6)
  { title: "Personal Problems", titleHe: "בעיות אישיות", author: "David Avidan", authorHe: "דוד אבידן", language: "HE", themes: ["self", "modern", "irony"] },
  { title: "Something for the Road", titleHe: "משהו לדרך", author: "David Avidan", authorHe: "דוד אבידן", language: "HE", themes: ["journey", "parting", "reflection"] },
  { title: "Practical Poems", titleHe: "שירים שימושיים", author: "David Avidan", authorHe: "דוד אבידן", language: "HE", themes: ["everyday", "poetry", "utility"] },
  { title: "Interim Poem", titleHe: "שיר ביניים", author: "David Avidan", authorHe: "דוד אבידן", language: "HE", themes: ["transition", "time", "uncertainty"] },
  { title: "Dance Music", titleHe: "מוזיקת ריקודים", author: "David Avidan", authorHe: "דוד אבידן", language: "HE", themes: ["dance", "joy", "rhythm"] },
  { title: "Electronic Message", titleHe: "מסר אלקטרוני", author: "David Avidan", authorHe: "דוד אבידן", language: "HE", themes: ["technology", "communication", "future"] },

  // ─── English Poets ──────────────────────────────────────────────

  // Robert Frost (10)
  { title: "The Road Not Taken", author: "Robert Frost", language: "EN", themes: ["choice", "journey", "reflection"] },
  { title: "Stopping by Woods on a Snowy Evening", author: "Robert Frost", language: "EN", themes: ["nature", "solitude", "duty"] },
  { title: "Fire and Ice", author: "Robert Frost", language: "EN", themes: ["destruction", "desire", "hatred"] },
  { title: "Nothing Gold Can Stay", author: "Robert Frost", language: "EN", themes: ["nature", "impermanence", "beauty"] },
  { title: "Mending Wall", author: "Robert Frost", language: "EN", themes: ["boundaries", "neighbors", "tradition"] },
  { title: "Birches", author: "Robert Frost", language: "EN", themes: ["nature", "youth", "imagination"] },
  { title: "After Apple-Picking", author: "Robert Frost", language: "EN", themes: ["labor", "sleep", "autumn"] },
  { title: "Desert Places", author: "Robert Frost", language: "EN", themes: ["loneliness", "emptiness", "winter"] },
  { title: "Acquainted with the Night", author: "Robert Frost", language: "EN", themes: ["solitude", "night", "melancholy"] },
  { title: "The Death of the Hired Man", author: "Robert Frost", language: "EN", themes: ["home", "compassion", "duty"] },

  // Emily Dickinson (10)
  { title: "Because I could not stop for Death", author: "Emily Dickinson", language: "EN", themes: ["death", "immortality", "time"] },
  { title: "I'm Nobody! Who are you?", author: "Emily Dickinson", language: "EN", themes: ["identity", "fame", "solitude"] },
  { title: "Hope is the thing with feathers", author: "Emily Dickinson", language: "EN", themes: ["hope", "resilience", "nature"] },
  { title: "Tell all the truth but tell it slant", author: "Emily Dickinson", language: "EN", themes: ["truth", "perception", "wisdom"] },
  { title: "A Bird came down the Walk", author: "Emily Dickinson", language: "EN", themes: ["nature", "observation", "beauty"] },
  { title: "I felt a Funeral, in my Brain", author: "Emily Dickinson", language: "EN", themes: ["despair", "madness", "consciousness"] },
  { title: "Wild Nights – Wild Nights!", author: "Emily Dickinson", language: "EN", themes: ["passion", "desire", "freedom"] },
  { title: "I dwell in Possibility", author: "Emily Dickinson", language: "EN", themes: ["poetry", "imagination", "freedom"] },
  { title: "The Soul selects her own Society", author: "Emily Dickinson", language: "EN", themes: ["solitude", "choice", "soul"] },
  { title: "There's a certain Slant of light", author: "Emily Dickinson", language: "EN", themes: ["winter", "despair", "nature"] },

  // W.B. Yeats (8)
  { title: "The Second Coming", author: "W.B. Yeats", language: "EN", themes: ["chaos", "prophecy", "change"] },
  { title: "The Lake Isle of Innisfree", author: "W.B. Yeats", language: "EN", themes: ["nature", "peace", "longing"] },
  { title: "When You Are Old", author: "W.B. Yeats", language: "EN", themes: ["love", "aging", "memory"] },
  { title: "Sailing to Byzantium", author: "W.B. Yeats", language: "EN", themes: ["aging", "art", "immortality"] },
  { title: "Easter, 1916", author: "W.B. Yeats", language: "EN", themes: ["revolution", "sacrifice", "change"] },
  { title: "An Irish Airman Foresees His Death", author: "W.B. Yeats", language: "EN", themes: ["war", "fate", "duty"] },
  { title: "Adam's Curse", author: "W.B. Yeats", language: "EN", themes: ["love", "beauty", "labor"] },
  { title: "The Wild Swans at Coole", author: "W.B. Yeats", language: "EN", themes: ["nature", "aging", "beauty"] },

  // T.S. Eliot (6)
  { title: "The Love Song of J. Alfred Prufrock", author: "T.S. Eliot", language: "EN", themes: ["anxiety", "aging", "modern"] },
  { title: "The Waste Land", author: "T.S. Eliot", language: "EN", themes: ["desolation", "rebirth", "modern"] },
  { title: "The Hollow Men", author: "T.S. Eliot", language: "EN", themes: ["emptiness", "despair", "modern"] },
  { title: "Journey of the Magi", author: "T.S. Eliot", language: "EN", themes: ["faith", "journey", "transformation"] },
  { title: "Preludes", author: "T.S. Eliot", language: "EN", themes: ["urban", "time", "melancholy"] },
  { title: "Ash Wednesday", author: "T.S. Eliot", language: "EN", themes: ["faith", "repentance", "hope"] },

  // Sylvia Plath (6)
  { title: "Daddy", author: "Sylvia Plath", language: "EN", themes: ["family", "oppression", "liberation"] },
  { title: "Lady Lazarus", author: "Sylvia Plath", language: "EN", themes: ["death", "rebirth", "defiance"] },
  { title: "Mirror", author: "Sylvia Plath", language: "EN", themes: ["truth", "aging", "identity"] },
  { title: "Ariel", author: "Sylvia Plath", language: "EN", themes: ["freedom", "power", "transcendence"] },
  { title: "Tulips", author: "Sylvia Plath", language: "EN", themes: ["recovery", "color", "identity"] },
  { title: "Morning Song", author: "Sylvia Plath", language: "EN", themes: ["motherhood", "birth", "love"] },

  // W.H. Auden (5)
  { title: "Funeral Blues", author: "W.H. Auden", language: "EN", themes: ["grief", "love", "loss"] },
  { title: "Musée des Beaux Arts", author: "W.H. Auden", language: "EN", themes: ["suffering", "art", "indifference"] },
  { title: "September 1, 1939", author: "W.H. Auden", language: "EN", themes: ["war", "fear", "hope"] },
  { title: "As I Walked Out One Evening", author: "W.H. Auden", language: "EN", themes: ["love", "time", "mortality"] },
  { title: "The Unknown Citizen", author: "W.H. Auden", language: "EN", themes: ["conformity", "identity", "modern"] },

  // Dylan Thomas (5)
  { title: "Do not go gentle into that good night", author: "Dylan Thomas", language: "EN", themes: ["death", "defiance", "aging"] },
  { title: "Fern Hill", author: "Dylan Thomas", language: "EN", themes: ["childhood", "nature", "time"] },
  { title: "And death shall have no dominion", author: "Dylan Thomas", language: "EN", themes: ["death", "immortality", "faith"] },
  { title: "In My Craft or Sullen Art", author: "Dylan Thomas", language: "EN", themes: ["poetry", "love", "art"] },
  { title: "A Refusal to Mourn", author: "Dylan Thomas", language: "EN", themes: ["death", "innocence", "defiance"] },

  // Maya Angelou (6)
  { title: "Still I Rise", author: "Maya Angelou", language: "EN", themes: ["resilience", "pride", "defiance"] },
  { title: "Phenomenal Woman", author: "Maya Angelou", language: "EN", themes: ["beauty", "confidence", "femininity"] },
  { title: "Caged Bird", author: "Maya Angelou", language: "EN", themes: ["freedom", "oppression", "hope"] },
  { title: "On the Pulse of Morning", author: "Maya Angelou", language: "EN", themes: ["hope", "history", "renewal"] },
  { title: "Alone", author: "Maya Angelou", language: "EN", themes: ["solitude", "community", "humanity"] },
  { title: "When I Think About Myself", author: "Maya Angelou", language: "EN", themes: ["humor", "resilience", "identity"] },

  // Langston Hughes (6)
  { title: "The Negro Speaks of Rivers", author: "Langston Hughes", language: "EN", themes: ["heritage", "history", "identity"] },
  { title: "Harlem", author: "Langston Hughes", language: "EN", themes: ["dreams", "frustration", "justice"] },
  { title: "I, Too", author: "Langston Hughes", language: "EN", themes: ["pride", "equality", "hope"] },
  { title: "Mother to Son", author: "Langston Hughes", language: "EN", themes: ["perseverance", "family", "struggle"] },
  { title: "Dreams", author: "Langston Hughes", language: "EN", themes: ["hope", "dreams", "mortality"] },
  { title: "Theme for English B", author: "Langston Hughes", language: "EN", themes: ["identity", "race", "education"] },

  // William Blake (6)
  { title: "The Tyger", author: "William Blake", language: "EN", themes: ["creation", "power", "mystery"] },
  { title: "The Lamb", author: "William Blake", language: "EN", themes: ["innocence", "creation", "gentleness"] },
  { title: "London", author: "William Blake", language: "EN", themes: ["suffering", "urban", "oppression"] },
  { title: "A Poison Tree", author: "William Blake", language: "EN", themes: ["anger", "deception", "revenge"] },
  { title: "The Sick Rose", author: "William Blake", language: "EN", themes: ["corruption", "love", "secrecy"] },
  { title: "Auguries of Innocence", author: "William Blake", language: "EN", themes: ["innocence", "vision", "nature"] },

  // Walt Whitman (6)
  { title: "Song of Myself", author: "Walt Whitman", language: "EN", themes: ["self", "nature", "democracy"] },
  { title: "O Captain! My Captain!", author: "Walt Whitman", language: "EN", themes: ["grief", "leadership", "sacrifice"] },
  { title: "I Hear America Singing", author: "Walt Whitman", language: "EN", themes: ["labor", "joy", "democracy"] },
  { title: "When Lilacs Last in the Dooryard Bloom'd", author: "Walt Whitman", language: "EN", themes: ["grief", "spring", "memory"] },
  { title: "Crossing Brooklyn Ferry", author: "Walt Whitman", language: "EN", themes: ["time", "connection", "city"] },
  { title: "A Noiseless Patient Spider", author: "Walt Whitman", language: "EN", themes: ["soul", "connection", "solitude"] },

  // Elizabeth Bishop (4)
  { title: "One Art", author: "Elizabeth Bishop", language: "EN", themes: ["loss", "mastery", "grief"] },
  { title: "The Fish", author: "Elizabeth Bishop", language: "EN", themes: ["nature", "observation", "triumph"] },
  { title: "In the Waiting Room", author: "Elizabeth Bishop", language: "EN", themes: ["identity", "childhood", "consciousness"] },
  { title: "Sestina", author: "Elizabeth Bishop", language: "EN", themes: ["grief", "family", "home"] },

  // Seamus Heaney (4)
  { title: "Digging", author: "Seamus Heaney", language: "EN", themes: ["heritage", "labor", "identity"] },
  { title: "Mid-Term Break", author: "Seamus Heaney", language: "EN", themes: ["death", "childhood", "grief"] },
  { title: "Death of a Naturalist", author: "Seamus Heaney", language: "EN", themes: ["nature", "growing up", "fear"] },
  { title: "Blackberry-Picking", author: "Seamus Heaney", language: "EN", themes: ["nature", "desire", "disappointment"] },

  // Edgar Allan Poe (5)
  { title: "The Raven", author: "Edgar Allan Poe", language: "EN", themes: ["grief", "loss", "madness"] },
  { title: "Annabel Lee", author: "Edgar Allan Poe", language: "EN", themes: ["love", "death", "memory"] },
  { title: "A Dream Within a Dream", author: "Edgar Allan Poe", language: "EN", themes: ["reality", "loss", "time"] },
  { title: "Alone", author: "Edgar Allan Poe", language: "EN", themes: ["solitude", "difference", "childhood"] },
  { title: "The Bells", author: "Edgar Allan Poe", language: "EN", themes: ["sound", "time", "death"] },

  // William Shakespeare (8)
  { title: "Sonnet 18 (Shall I compare thee)", author: "William Shakespeare", language: "EN", themes: ["beauty", "love", "immortality"] },
  { title: "Sonnet 73 (That time of year)", author: "William Shakespeare", language: "EN", themes: ["aging", "love", "mortality"] },
  { title: "Sonnet 116 (Let me not to the marriage)", author: "William Shakespeare", language: "EN", themes: ["love", "constancy", "truth"] },
  { title: "Sonnet 130 (My mistress' eyes)", author: "William Shakespeare", language: "EN", themes: ["love", "beauty", "honesty"] },
  { title: "Sonnet 29 (When, in disgrace)", author: "William Shakespeare", language: "EN", themes: ["despair", "love", "redemption"] },
  { title: "Sonnet 30 (When to the sessions)", author: "William Shakespeare", language: "EN", themes: ["memory", "grief", "love"] },
  { title: "Sonnet 55 (Not marble nor the gilded)", author: "William Shakespeare", language: "EN", themes: ["immortality", "love", "time"] },
  { title: "Sonnet 60 (Like as the waves)", author: "William Shakespeare", language: "EN", themes: ["time", "mortality", "beauty"] },

  // William Wordsworth (5)
  { title: "I Wandered Lonely as a Cloud", author: "William Wordsworth", language: "EN", themes: ["nature", "solitude", "joy"] },
  { title: "Tintern Abbey", author: "William Wordsworth", language: "EN", themes: ["memory", "nature", "growth"] },
  { title: "The World Is Too Much with Us", author: "William Wordsworth", language: "EN", themes: ["nature", "materialism", "loss"] },
  { title: "Ode: Intimations of Immortality", author: "William Wordsworth", language: "EN", themes: ["childhood", "memory", "immortality"] },
  { title: "Composed upon Westminster Bridge", author: "William Wordsworth", language: "EN", themes: ["beauty", "city", "morning"] },

  // John Keats (5)
  { title: "Ode to a Nightingale", author: "John Keats", language: "EN", themes: ["beauty", "mortality", "escape"] },
  { title: "Ode on a Grecian Urn", author: "John Keats", language: "EN", themes: ["beauty", "truth", "art"] },
  { title: "To Autumn", author: "John Keats", language: "EN", themes: ["autumn", "abundance", "time"] },
  { title: "Bright Star", author: "John Keats", language: "EN", themes: ["love", "constancy", "nature"] },
  { title: "La Belle Dame sans Merci", author: "John Keats", language: "EN", themes: ["love", "enchantment", "loss"] },

  // Percy Bysshe Shelley (4)
  { title: "Ozymandias", author: "Percy Bysshe Shelley", language: "EN", themes: ["power", "impermanence", "hubris"] },
  { title: "Ode to the West Wind", author: "Percy Bysshe Shelley", language: "EN", themes: ["nature", "change", "power"] },
  { title: "To a Skylark", author: "Percy Bysshe Shelley", language: "EN", themes: ["joy", "nature", "beauty"] },
  { title: "Love's Philosophy", author: "Percy Bysshe Shelley", language: "EN", themes: ["love", "nature", "desire"] },
];
