import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // Enable CORS (Allows your website to talk to this backend)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { message } = req.body;

    try {
        // Setup Gemini (The Free AI)
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // The "Scientific" System Prompt
        const prompt = `
            You are a rigorous scientific research assistant for MyOpenComm.
            QUESTION: "${message}"

            INSTRUCTIONS:
            1. Answer ONLY using verified scientific concepts (Biology, Psychology, Neuroscience).
            2. You MUST cite a real scientific paper or author for every major claim.
            3. Format citations like this: [Author, Year].
            4. If there is no scientific consensus, state that clearly.
            5. Keep the answer concise (under 150 words).
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ answer: text });

    } catch (error) {
        console.error(error);
        res.status(500).json({ answer: "I am currently overloaded. Please try again in a minute." });
    }
}
