/**
 * Vercel Serverless Proxy — QuizzApp Indo
 *
 * Semua request dari frontend ke /api/* akan masuk ke sini.
 * Proxy ini yang inject X-API-KEY ke backend, bukan frontend.
 * API_KEY disimpan di Vercel Environment Variables (server-side),
 * sehingga TIDAK pernah masuk ke browser bundle.
 *
 * Vercel Dashboard → Settings → Environment Variables:
 *   API_KEY = your_real_api_key   ← tanpa prefix VITE_
 *   API_URL = https://your-backend.com/api
 */
export default async function handler(req, res) {
  // Strip /api prefix untuk dapat path aslinya
  const path = req.url.replace(/^\/api/, "") || "/";
  const targetUrl = `${process.env.API_URL}${path}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.API_KEY, // ✅ Server-side only
        // Forward cookies untuk cookie-based auth
        ...(req.headers.cookie ? { Cookie: req.headers.cookie } : {}),
        // Forward Authorization header jika ada (JWT fallback)
        ...(req.headers.authorization
          ? { Authorization: req.headers.authorization }
          : {}),
      },
    };

    // Attach body untuk non-GET requests
    if (req.method !== "GET" && req.method !== "HEAD") {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);

    // Forward Set-Cookie header dari backend (untuk cookie-based auth)
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      res.setHeader("Set-Cookie", setCookie);
    }

    // Handle non-JSON responses (e.g. 204 No Content)
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return res.status(response.status).end();
    }

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("[Proxy Error]", error);
    return res.status(502).json({ message: "Bad Gateway: could not reach backend." });
  }
}
