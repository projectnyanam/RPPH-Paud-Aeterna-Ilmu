import { GoogleGenAI } from "@google/genai";
import express from "express";

const app = express();
app.post('/test', async (req, res) => {
  try {
    const ai = new GoogleGenAI({ apiKey: "AIzaSyFakeKey..." });
    await ai.models.generateContent({ model: "gemini-3.5-flash", contents: "test" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.listen(3005, () => console.log('started'));
