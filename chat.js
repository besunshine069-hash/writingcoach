export default async function handler(req, res) {
  try {
    const { message, systemPrompt } = req.body;
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API_KEY not configured." });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
          ...(systemPrompt && {
            systemInstruction: { parts: [{ text: systemPrompt }] },
          }),
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
