export const detectLanguage = (text) => {
  if (!text || typeof text !== "string") return "unknown";

  // 1. Japanese Detection (Hiragana, Katakana, Kanji)
  const jpRegex =
    /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/;
  if (jpRegex.test(text)) {
    return "jp";
  }

  // 2. English vs Indonesian (Heuristic based on common words)
  const lowerText = text.toLowerCase();

  // Common Indonesian words (exclusive or very common)
  const idWords = [
    "yang",
    "dan",
    "di",
    "dari",
    "ini",
    "itu",
    "apa",
    "siapa",
    "bagaimana",
    "adalah",
    "saya",
    "kamu",
    "tidak",
    "bisa",
    "untuk",
    "dengan",
    "ke",
    "pada",
    "dalam",
    "atau",
    "oleh",
    "jika",
    "sebagai",
    "karena",
    "akan",
    "sudah",
    "ada",
    "mereka",
    "kita",
    "kami",
    "berfungsi",
    "merupakan",
    "contoh",
    "penggunaan",
    "menggunakan",
    "seperti",
    "tetapi",
    "namun",
  ];
  // Common English words
  const enWords = [
    "the",
    "and",
    "is",
    "in",
    "of",
    "to",
    "that",
    "it",
    "for",
    "on",
    "with",
    "as",
    "this",
    "was",
    "at",
  ];

  const words = lowerText.split(/\s+/); // Simple tokenizer

  let idCount = 0;
  let enCount = 0;

  words.forEach((word) => {
    // Strip punctuation
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "");
    if (idWords.includes(cleanWord)) idCount++;
    if (enWords.includes(cleanWord)) enCount++;
  });

  if (idCount > enCount) return "id";
  if (enCount > idCount) return "en";

  // Fallback: If no clear winner, return 'unknown' or maybe check character frequency?
  // For now return 'unknown' to be safe (show button).
  return "unknown";
};
