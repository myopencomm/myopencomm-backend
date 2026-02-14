// api/subscribe.js
export default async function handler(req, res) {
    // 1. CORS Setup
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') { res.status(200).end(); return; }

    const { email, source } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const REPO = process.env.GITHUB_REPO; // e.g., "username/repo"
    const TOKEN = process.env.GITHUB_TOKEN;
    const PATH = "subscribers.csv"; // The file we will save to

    try {
        // 2. Get current file content from GitHub
        const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });

        let content = "Date,Email,Source\n"; // Header for new file
        let sha = null;

        if (getRes.ok) {
            const data = await getRes.json();
            content = Buffer.from(data.content, 'base64').toString('utf-8'); // Decode existing content
            sha = data.sha; // Needed to update the file
        }

        // 3. Append new email
        const date = new Date().toISOString().split('T')[0];
        const newLine = `${date},${email},${source || 'Website'}\n`;
        content += newLine;

        // 4. Save back to GitHub
        const putRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `New subscriber: ${email}`,
                content: Buffer.from(content).toString('base64'), // Re-encode to Base64
                sha: sha // Required if updating existing file
            })
        });

        if (putRes.ok) {
            res.status(200).json({ success: true });
        } else {
            const err = await putRes.json();
            throw new Error(JSON.stringify(err));
        }

    } catch (error) {
        console.error("GitHub Error:", error);
        res.status(500).json({ error: "Failed to save email." });
    }
}
