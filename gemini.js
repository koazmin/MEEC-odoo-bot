export default async function handler(req, res) {
  const { question } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  const SYSTEM_PROMPT = "Odoo 17 ERP ကို မြန်မာလိုရှင်းပြမယ့် chatbot တစ်ယောက်ပါ။ မေးခွန်းနဲ့သက်ဆိုင်တဲ့ Sales, Inventory, Purchase, CRM, Accounting module များအကြောင်းနားလည်အောင် ရှင်းပြပေးပါ။";

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: SYSTEM_PROMPT + "\n\nမေးခွန်း: " + question }]
        }]
      })
    }
  );

  const data = await response.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  res.status(200).json({ reply });
}