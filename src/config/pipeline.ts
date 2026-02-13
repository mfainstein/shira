export const PIPELINE_CONFIG = {
  concurrency: 1,
  maxRetries: 2,
  backoffDelay: 5000,
  models: ["CLAUDE", "GPT", "GEMINI"] as const,
  comparisonModel: "CLAUDE" as const,
  artStyle: "MINIMALIST" as const,
};

export const POETRYDB_CONFIG = {
  baseUrl: "https://poetrydb.org",
  preferredAuthors: [
    "William Shakespeare",
    "Emily Dickinson",
    "Robert Frost",
    "William Blake",
    "Walt Whitman",
    "Percy Bysshe Shelley",
    "John Keats",
    "William Wordsworth",
    "Edgar Allan Poe",
    "Langston Hughes",
  ],
  themeSearchTerms: {
    love: ["love", "heart", "beloved", "passion"],
    nature: ["tree", "river", "mountain", "flower", "sky"],
    death: ["death", "grave", "mortal", "eternal"],
    time: ["time", "hour", "moment", "forever"],
    war: ["war", "battle", "soldier", "peace"],
    beauty: ["beauty", "fair", "radiant", "light"],
    loss: ["loss", "grief", "mourn", "farewell"],
    hope: ["hope", "dream", "dawn", "tomorrow"],
  } as Record<string, string[]>,
};

export const ELEVENLABS_CONFIG = {
  ttsModel: "eleven_multilingual_v2",
};

export const QUEUE_CONFIG = {
  concurrency: PIPELINE_CONFIG.concurrency,
  maxRetries: PIPELINE_CONFIG.maxRetries,
  backoffDelay: PIPELINE_CONFIG.backoffDelay,
};
