export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { agency, client, data } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // stable + works
        messages: [
          {
            role: "user",
            content: `
You are a senior Google Ads auditor.

IMPORTANT:
Return ONLY a clean HTML report with inline CSS.
NO markdown. NO explanation.

STYLE:
- Dark theme
- Cards layout
- Sections:
  1. Cover (Client, Agency)
  2. Executive Summary (cards)
  3. Key Issues
  4. Recommendations

DATA:
${data}

Client: ${client}
Agency: ${agency}
            `,
          },
        ],
      }),
    });

    const json = await response.json();

    const content =
      json?.choices?.[0]?.message?.content || "<p>No response received</p>";

    return res.status(200).json({ result: content });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
