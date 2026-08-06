import gemini from "../lib/gemini.js";
import  astraPrompt  from "../lib/astraPrompt.js";

export const chatWithAi = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: astraPrompt,
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "Understood. I am Astra, the AI companion of QkChat. I'll stay in character and follow these instructions.",
          },
        ],
      },
      ...history.map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      })),
    ];

    const result = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: astraPrompt,
      }
    });

    const reply = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Gemini Error:", error);
    if (error.status === 503) {
      return res
        .status(503)
        .json({ message: "Gemini is busy. Try again in few seconds." });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server Error" });
  }
};
