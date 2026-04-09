export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a senior Google Ads audit expert. Give clear, practical insights.\n\n${prompt}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Gemini request failed",
      });
    }

    const content =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";

    return res.status(200).json({ result: content });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
}
