import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Google Gen AI client setup
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // 1. API: Short & Crispy JEE AI chat assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!ai) {
        return res.status(500).json({
          error: "Gemini API key is not configured. Please add GEMINI_API_KEY in Settings > Secrets.",
        });
      }

      // Convert simple message history to the format expected by the SDK
      const contents = [];
      
      // Inject system instruction in config
      const systemInstruction = 
        "You are Kunal's personal JEE selector chatbot for the JSP (JEE Selector Party) app. " +
        "Your goal is to guide him to get a seat in MNC (Mathematics and Computing) at IIT Delhi. " +
        "CRITICAL INSTRUCTION: You must be extremely brief, short, and crispy! " +
        "ONLY answer exactly what is asked. Do not ask any follow-up questions. " +
        "No greetings, no extra advice unless directly asked, and NO EXTRA QUESTIONS. " +
        "Answer directly, jo pucha hai wahi bataye, no extra questions or options. Keep explanation sharp and maximum 2-3 sentences. " +
        "You can answer in a mix of Hindi and English (Hinglish) because Kunal prefers a natural JEE peer tone.";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
        },
      });

      const replyText = response.text || "I was unable to get a response.";
      res.json({ reply: replyText });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Something went wrong" });
    }
  });

  // Serve static UI assets or delegate to Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
