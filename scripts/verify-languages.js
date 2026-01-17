import axios from "axios";

const API_URL = "http://127.0.0.1:8001/api/public/translations";

async function verify() {
  try {
    console.log("🔍 Fetching translations...");
    const res = await axios.get(API_URL);
    const data = res.data.data;

    const languages = Object.keys(data);
    console.log("✅ Available Languages:", languages.join(", "));

    // Sample check: navbar.topics (Existing key)
    console.log("\n📊 Sample Check (navbar.topics):");
    languages.forEach((lang) => {
      const val = data[lang]?.navbar?.topics;
      console.log(`[${lang.toUpperCase()}] ${val || "❌ MISSING"}`);
    });

    // Sample check: settings.title
    console.log("\n📊 Sample Check (settings.title):");
    languages.forEach((lang) => {
      const val = data[lang]?.settings?.title;
      console.log(`[${lang.toUpperCase()}] ${val || "❌ MISSING"}`);
    });

    // Sample check: landing.demo.q1 (Nested)
    console.log("\n📊 Sample Check (landing.demo.q1) - Nested:");
    languages.forEach((lang) => {
      const val = data[lang]?.landing?.demo?.q1;
      console.log(`[${lang.toUpperCase()}] ${val || "❌ MISSING"}`);
    });
  } catch (error) {
    console.error("❌ Failed:", error.message);
  }
}

verify();
