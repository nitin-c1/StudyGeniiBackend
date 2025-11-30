import File from "../model/file.model.js";
import dotenv from "dotenv";

dotenv.config();

// ========================== AI SUMMARY GENERATOR ==========================
export const getContentSummary = async (req, res) => {
  const fileId = req.params.id;

  if (!fileId) {
    return res.status(400).json({ message: "File ID missing" });
  }

  try {
    const fileData = await File.findById(fileId).lean();

    if (!fileData) {
      return res.status(404).json({ message: "No file found with this ID" });
    }

    // Prompt for AI summarization
    const prompt = `
Act as an expert academic assistant.

A teacher has uploaded the following study resource:
${JSON.stringify(fileData)}

Your tasks:
1. Conceptually analyze the material (assume you can access its content).
2. Create a short educational summary (4–6 lines).
3. Provide 3–5 key concepts or themes.

Respond ONLY in this JSON format:
{
  "summary": "short summary here",
  "themes": ["topic1", "topic2", "topic3"]
}
`;

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.6,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API returned error: ${aiResponse.status}`);
    }

    const responseData = await aiResponse.json();
    const aiText =
      responseData?.choices?.[0]?.message?.content ||
      responseData?.choices?.[0]?.text ||
      "";

    console.log("AI Summary Output:", aiText);

    const cleaned = aiText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const jsonExtract = cleaned.match(/\{[\s\S]*\}/);
    let parsed = {};

    if (jsonExtract) {
      try {
        parsed = JSON.parse(jsonExtract[0]);
      } catch (err) {
        console.error("JSON Parsing Failed (Summary):", err.message);
      }
    }

    const finalSummary = {
      summary: parsed.summary?.trim() || "Summary unavailable",
      themes: Array.isArray(parsed.themes)
        ? parsed.themes.map((t) => t.trim())
        : [],
    };

    return res.status(200).json({
      success: true,
      file: fileData.title,
      aiSummary: finalSummary,
    });
  } catch (error) {
    console.error("Summary Generation Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not generate summary",
      error: error.message,
    });
  }
};

// ========================== AI QUIZ CREATOR ==========================
export const getContentQuiz = async (req, res) => {
  const fileId = req.params.id;

  if (!fileId) {
    return res.status(400).json({ message: "File ID missing" });
  }

  try {
    const fileData = await File.findById(fileId).lean();

    if (!fileData) {
      return res.status(404).json({ message: "No file found with this ID" });
    }

    const prompt = `
You are a professional quiz creator.

Using the file information below:
${JSON.stringify(fileData)}

Generate exactly 5 quiz questions with answers.

Format the response ONLY like this:
{
  "quiz": [
    { "question": "Question text 1", "answer": "Answer 1" },
    { "question": "Question text 2", "answer": "Answer 2" },
    { "question": "Question text 3", "answer": "Answer 3" },
    { "question": "Question text 4", "answer": "Answer 4" },
    { "question": "Question text 5", "answer": "Answer 5" }
  ]
}
`;

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API returned error: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const aiText =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      "";

    console.log("AI Quiz Output:", aiText);

    const cleaned = aiText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const jsonExtract = cleaned.match(/\{[\s\S]*\}/);
    let parsed = {};

    if (jsonExtract) {
      try {
        parsed = JSON.parse(jsonExtract[0]);
      } catch (err) {
        console.error("JSON Parsing Failed (Quiz):", err.message);
      }
    }

    const quiz = Array.isArray(parsed.quiz)
      ? parsed.quiz.map((item) => ({
          question: item.question?.trim() || "",
          answer: item.answer?.trim() || "",
        }))
      : [];

    return res.status(200).json({
      success: true,
      file: fileData.title,
      quiz,
    });
  } catch (error) {
    console.error("Quiz Generation Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Quiz generation failed",
      error: error.message,
    });
  }
};
