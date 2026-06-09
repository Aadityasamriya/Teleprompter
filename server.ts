import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/ai/enhance", async (req, res) => {
    try {
      const { text, mode } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      let systemInstruction = "You are a professional teleprompter script editor.";
      if (mode === "shorten") {
        systemInstruction += " Rewrite the script to be concise and shorter without losing the main message. Provide only the rewritten text.";
      } else if (mode === "expand") {
        systemInstruction += " Expand on the script, making it more detailed and engaging. Provide only the rewritten text.";
      } else if (mode === "professional") {
        systemInstruction += " Rewrite the script in a polished, highly professional, business-appropriate tone. Provide only the rewritten text.";
      } else if (mode === "engaging") {
        systemInstruction += " Rewrite the script to be extremely engaging, enthusiastic, and tailored for a modern youtube/tiktok audience. Hook the audience. Provide only the rewritten text.";
      } else {
        systemInstruction += " Improve the script for clarity and flow. Fix typos and grammar. Provide only the rewritten text.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: text,
        config: {
          systemInstruction,
        }
      });

      res.json({ result: response.text });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to process text" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
