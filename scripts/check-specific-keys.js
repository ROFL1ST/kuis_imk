import axios from "axios";

const API_URL = "http://localhost:8080/api/public/translations";

async function check() {
  try {
    console.log("🔍 Checking specific keys...");
    const res = await axios.get(API_URL);
    const data = res.data.data;

    const keysToCheck = [
      "createChallenge.noLimit",
      "settings.noWager",
      "challenge.playNow",
      "challenge.gameType",
      "challenge.waitingForHost",
    ];

    const langs = ["id", "en"];

    langs.forEach((lang) => {
      console.log(`\n--- [${lang.toUpperCase()}] ---`);
      keysToCheck.forEach((key) => {
        const parts = key.split(".");
        let val = data[lang];
        for (const p of parts) {
          val = val ? val[p] : undefined;
        }
        console.log(`${key}: ${val ? `"${val}"` : "❌ MISSING"}`);
      });
    });
  } catch (error) {
    console.error("❌ Failed:", error.message);
  }
}

check();
