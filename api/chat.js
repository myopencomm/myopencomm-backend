import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') { res.status(200).end(); return; }
    if (req.method === 'GET') { return res.status(200).json({ status: "Scientific Chatbot Online" }); }

    const body = req.body || {};
    const message = body.message;
    // Default to English if no language is sent
    const language = body.language || 'en'; 

    if (!message) { return res.status(400).json({ error: "Message is required" }); }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using the reliable free model
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
            You are a rigorous scientific research assistant for MyOpenComm.
            USER LANGUAGE: ${language === 'fr' ? 'FRENCH' : 'ENGLISH'}
            QUESTION: "${message}"
            
            INSTRUCTIONS:
            1. Answer IN THE USER'S LANGUAGE (${language === 'fr' ? 'French' : 'English'}).
            2. Answer ONLY using verified scientific concepts.
            3. You MUST cite a real scientific paper/author for every major claim.
            4. Keep the answer concise (under 150 words).
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ answer: text });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ answer: language === 'fr' ? "Je suis surchargé. Réessayez plus tard." : "I am overloaded. Please try again later." });
    }
}
