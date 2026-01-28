import { translations } from "./src/utils/translations.js";

console.log("Checking translations.id.quiz.shortAnswer...");
try {
  if (
    translations.id &&
    translations.id.quiz &&
    translations.id.quiz.shortAnswer
  ) {
    console.log("FOUND:", translations.id.quiz.shortAnswer);
  } else {
    console.log("NOT FOUND");
    if (!translations.id) console.log("id block missing");
    else if (!translations.id.quiz) console.log("quiz block missing");
  }

  // Check En
  if (
    translations.en &&
    translations.en.quiz &&
    translations.en.quiz.shortAnswer
  ) {
    console.log("FOUND EN:", translations.en.quiz.shortAnswer);
  } else {
    console.log("NOT FOUND EN");
  }
} catch (e) {
  console.error("Error accessing translations:", e);
}
