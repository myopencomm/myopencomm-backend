// api/chat.js - TEMPORARY DEBUGGER
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // CORS Setup (Standard)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        // 1. Manually fetch the list of models available to YOUR specific key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("API Key is missing in Vercel!");

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            throw new Error(`Google API Error: ${JSON.stringify(data.error)}`);
        }

        // 2. Filter for "generateContent" models (the ones we can use for chat)
        const validModels = data.models
            .filter(m => m.supportedGenerationMethods.includes("generateContent"))
            .map(m => m.name);

        // 3. Show us the list
        res.status(200).json({ 
            status: "DEBUG MODE",
            available_models: validModels 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
