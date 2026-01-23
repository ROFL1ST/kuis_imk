import axios from "axios";

const API_URL = "http://localhost:8080/api/public/translations";

async function check() {
  try {
    console.log("🔍 Checking specific keys reported by user...");
    const res = await axios.get(API_URL);
    const data = res.data.data;

    // Keys user said are missing
    const keysToCheck = [
      "challenge.settings",
      "settings.wager", // User said 'wagger' but likely meant 'wager'
      "settings.noWager",
      "challenge.playNow",
      "challenge.gameType",
      "createChallenge.wager",
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
