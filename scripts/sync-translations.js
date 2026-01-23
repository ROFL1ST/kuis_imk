import { translations } from "../src/utils/translations.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Config
const API_URL = process.env.VITE_API_URL || "http://localhost:8080/api";
const CREDENTIALS = {
  username: process.env.SYNC_USERNAME,
  password: process.env.SYNC_PASSWORD,
};

async function sync() {
  try {
    console.log(`🔌 API: ${API_URL}`);
    console.log(`👤 User: ${CREDENTIALS.username}`);

    console.log("🔑 Logging in as superadmin...");
    const loginRes = await axios.post(`${API_URL}/admin/login`, CREDENTIALS);

    // Debug log
    // console.log("Login Response Headers:", JSON.stringify(loginRes.headers, null, 2));

    const cookies = loginRes.headers["set-cookie"];
    if (!cookies) {
      console.error("❌ Login succeeded but no cookie received!");
      return;
    }

    console.log("✅ Login success! Cookie acquired.");

    console.log("📦 Syncing translations...");
    const syncRes = await axios.post(
      `${API_URL}/admin/translations/sync`,
      translations,
      {
        headers: {
          Cookie: Array.isArray(cookies) ? cookies.join("; ") : cookies,
        },
      },
    );

    console.log("✅ Sync complete!");
    console.log(`📊 Processed: ${syncRes.data.count} keys`);
  } catch (error) {
    console.error("❌ Sync failed:");
    console.error(error);
  }
}

sync();
