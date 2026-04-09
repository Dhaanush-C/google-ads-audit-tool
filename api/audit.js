export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://google-ads-audit-tool.vercel.app",
          "X-Title": "Google Ads Audit Tool",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct:free",
          messages: [
            {
              role: "system",
              content:
                "You are a senior Google Ads audit expert. Give clear, practical insights in simple bullet points.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          data?.message ||
          "OpenRouter request failed",
      });
    }

    const content =
      data?.choices?.[0]?.message?.content || "No response received.";

    return res.status(200).json({ result: content });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
}
