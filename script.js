// api/gemini.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// IMPORTANT: Your API Key MUST be set as an Environment Variable in Vercel.
// Name it GEMINI_API_KEY in Vercel project settings.
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("GEMINI_API_KEY environment variable is not set.");
    // In a real application, you might want to return an error response here for API calls
    // but for Vercel, it's better to ensure it's set in the environment.
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Using gemini-pro for general chat

const SYSTEM_PROMPT = `မင်္ဂလာပါ။ Bavin Myanmar အတွက် Odoo 17 Enterprise ကို အသုံးပြုနေသူများအတွက် ကူညီပေးမယ့် Assistant ဖြစ်ပါတယ်။

ကျွန်တော်ရဲ့ တာဝန်မှာ Odoo 17 ရဲ့ module အားလုံး (Sales, Inventory, Purchase, Accounting, CRM, Contacts အပါအဝင်) နဲ့ပတ်သက်တဲ့ မေးခွန်းများကို ရိုးရှင်းပြီး နားလည်ရလွယ်အောင်၊ ရေရှည်အသုံးဝင်အောင် မြန်မာလိုဖြေကြားပေးဖို့ ဖြစ်ပါတယ်။

ဖြေကြားမှုများမှာ:
- တိကျသေချာပြီး
- အတိုချုံးသာမက လိုအပ်သည်များကို နမူနာနဲ့တကွ ဖြေကြားနိုင်ရန်
- ပရော်ဖက်ရှင်နယ်သဘောထားဖြင့် ကူညီမှုအရင်းအမြစ်ဖြစ်ဖို့ ရည်ရွယ်ပါတယ်။

မေးခွန်းသည် Odoo 17 နှင့် မသက်ဆိုင်ပါက —
“ကျွန်တော်က Odoo 17 အတွက်ပဲလေ့ကျင့်ထားတဲ့ Assistant ဖြစ်လို့ Odoo နှင့်ပတ်သက်တဲ့ မေးခွန်းများကိုသာ ဖြေပေးနိုင်ပါတယ်။ တခြားအကြောင်းအရာတွေအတွက် Google၊ YouTube ဒါမှမဟုတ် သက်ဆိုင်တဲ့ အကူအညီ ပေးနိုင်တဲ့သူတွေကို ဆက်သွယ်ကြည့်ပါခင်ဗျာ။” ဟု ယဉ်ကျေးစွာ ပြန်လည်ဖြေကြားပါမယ်။

အဆင့်များပြသသည့် မေးခွန်းများအတွက်တော့ တစ်ဆင့်ချင်းနည်းလမ်းများ၊ လုပ်ဆောင်ပုံနမူနာများဖြင့် လမ်းညွှန်ပေးပါမယ်။`;

// This is the main serverless function handler for Vercel
module.exports = async (req, res) => {
    // Set CORS headers for security and to allow client-side requests
    res.setHeader('Access-Control-Allow-Origin', '*'); // Consider restricting this to your Vercel domain in production (e.g., 'https://your-app-name.vercel.app')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.status(200).send();
    }

    // Ensure it's a POST request
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Only POST requests are accepted.' });
    }

    const { question, history } = req.body; // Expect 'question' and 'history' from the client

    if (!question) {
        return res.status(400).json({ error: "မေးခွန်းမပါဝင်ပါ။" });
    }

    try {
        // Initialize chat history with the system prompt
        // The system prompt is always the first "user" message in the history
        let currentHistory = [{ role: "user", parts: SYSTEM_PROMPT }];

        // If history is provided from the client, append it (excluding its own system prompt if present)
        if (history && Array.isArray(history)) {
             // Filter out any system prompts if the client accidentally sends it in the history
            const filteredHistory = history.filter(msg => msg.parts !== SYSTEM_PROMPT);
            currentHistory = currentHistory.concat(filteredHistory);
        }

        // The new user question is added to the history just before sending to Gemini
        currentHistory.push({ role: "user", parts: question });

        const chat = model.startChat({
            history: currentHistory, // Pass the entire conversation history for context
            generationConfig: {
                maxOutputTokens: 2000, // Allow for longer, more complete answers
            },
        });

        // Send *only the latest user message* to the chat, as the history is already provided
        const result = await chat.sendMessage(question);
        const response = await result.response;
        const text = response.text();

        // Add the bot's reply to the history for the *next* request
        currentHistory.push({ role: "model", parts: text });

        // Send back the bot's reply AND the updated history for the client to store
        res.json({ reply: text, updatedHistory: currentHistory });

    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        // More specific error messages can be added based on error.code or error.status
        if (error.response && error.response.status === 429) {
            return res.status(429).json({ error: "ခဏစောင့်ပါ။ မေးခွန်းများ အလွန်များပြားနေပါသည်။" });
        }
        res.status(500).json({ error: "✨ ဆက်သွယ်မှုမအောင်မြင်ပါ။ ပြန်လည်ကြိုးစားပါ။" });
    }
};
