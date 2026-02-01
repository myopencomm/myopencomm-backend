import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // 1. CORS Setup (Allows your website to talk to this backend)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // 2. Handle Preflight (OPTIONS)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 3. Safety Check for Browser Visits
    if (req.method === 'GET') {
        return res.status(200).json({ status: "Scientific Chatbot is Online (Gemini 2.0 Flash)" });
    }

    // 4. Parse Message Safely
    const body = req.body || {};
    const message = body.message;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        // 5. Connect to Google AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // WE USE THE MODEL THAT WAS CONFIRMED TO EXIST IN YOUR DEBUG LIST
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // 6. The Scientific System Prompt
        const prompt = `
            You are a rigorous scientific research assistant for MyOpenComm.
            QUESTION: "${message}"
            
            INSTRUCTIONS:
            1. Answer ONLY using verified scientific concepts (Biology, Psychology, Neuroscience, Communication Theory).
            2. You MUST cite a real scientific paper or author for every major claim.
            3. Format citations like this: [Author, Year].
            4. If there is no scientific consensus, state that clearly.
            5. Keep the answer concise (under 150 words).
            6. Do not mention that you are an AI; act as a research assistant.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ answer: text });

    } catch (error) {
        console.error("AI Error:", error);
        // This will print the exact Google error to the Vercel logs if it fails again
        res.status(500).json({ 
            answer: "I am unable to access the research database at this moment. Please try again later.",
            debug_error: error.message 
        });
    }
}
