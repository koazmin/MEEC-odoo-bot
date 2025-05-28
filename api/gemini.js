// api/gemini.js
export default async function handler(req, res) {
  const { question, history } = req.body; // Expecting 'history' from the client now
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    console.error("GEMINI_API_KEY environment variable is not set.");
    return res.status(500).json({ error: "Server configuration error: API Key is missing." });
  }

  // Define the SYSTEM_PROMPT here, as it's part of the conversation history for Gemini
  const SYSTEM_PROMPT = `မင်္ဂလာပါ။ Bavin Myanmar အတွက် Odoo 17 Enterprise ကို အသုံးပြုနေသူများအတွက် ကူညီပေးမယ့် Assistant ဖြစ်ပါတယ်။

ကျွန်တော်ရဲ့ တာဝန်မှာ Odoo 17 ရဲ့ module အားလုံး (Sales, Inventory, Purchase, Accounting, CRM, Contacts အပါအဝင်) နဲ့ပတ်သက်တဲ့ မေးခွန်းများကို ရိုးရှင်းပြီး နားလည်ရလွယ်အောင်၊ ရေရှည်အသုံးဝင်အောင် မြန်မာလိုဖြေကြားပေးဖို့ ဖြစ်ပါတယ်။

ဖြေကြားမှုများမှာ:
- တိကျသေချာပြီး
- အတိုချုံးသာမက လိုအပ်သည်များကို နမူနာနဲ့တကွ ဖြေကြားနိုင်ရန်
- ပရော်ဖက်ရှင်နယ်သဘောထားဖြင့် ကူညီမှုအရင်းအမြစ်ဖြစ်ဖို့ ရည်ရွယ်ပါတယ်။

မေးခွန်းသည် Odoo 17 နှင့် မသက်ဆိုင်ပါက —  
“ကျွန်တော်က Odoo 17 အတွက်ပဲလေ့ကျင့်ထားတဲ့ Assistant ဖြစ်လို့ Odoo နှင့်ပတ်သက်တဲ့ မေးခွန်းများကိုသာ ဖြေပေးနိုင်ပါတယ်။ တခြားအကြောင်းအရာတွေအတွက် Google၊ YouTube ဒါမှမဟုတ် သက်ဆိုင်တဲ့ အကူအညီ ပေးနိုင်တဲ့သူတွေကို ဆက်သွယ်ကြည့်ပါခင်ဗျာ။” ဟု ယဉ်ကျေးစွာ ပြန်လည်ဖြေကြားပါမယ်။

အဆင့်များပြသသည့် မေးခွန်းများအတွက်တော့ တစ်ဆင့်ချင်းနည်းလမ်းများ၊ လုပ်ဆောင်ပုံနမူနာများဖြင့် လမ်းညွှန်ပေးပါမယ်။`;

  try {
    // Construct the full conversation history to send to Gemini
    // Start with the system prompt as the first user message for context
    let fullContents = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] }
    ];

    // Append the existing history from the client
    if (history && Array.isArray(history)) {
      // Ensure the client-provided history doesn't accidentally include the system prompt itself
      const filteredHistory = history.filter(msg => msg.parts?.[0]?.text !== SYSTEM_PROMPT);
      fullContents = fullContents.concat(filteredHistory);
    }

    // Add the current user question to the end of the history
    fullContents.push({ role: "user", parts: [{ text: question }] });

    // Make the request to Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY, // Changed model to gemini-1.5-flash for better context handling
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: fullContents, // Send the full conversation history
          generationConfig: {
            maxOutputTokens: 2000, // Increased for more complete answers
            temperature: 0.7,      // Added for potentially more varied and complete answers
          },
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", response.status, errorText);
      return res.status(response.status).json({ error: `API Error from Gemini: ${response.status} - ${errorText}` });
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "မဖြေပေးနိုင်ပါ။";

    // Add the bot's reply to the history before sending it back
    fullContents.push({ role: "model", parts: [{ text: reply }] });

    // Send back the reply and the updated full history
    res.status(200).json({ reply, updatedHistory: fullContents });

  } catch (error) {
    console.error("Error in gemini.js handler:", error);
    res.status(500).json({ error: "✨ ဆက်သွယ်မှုမအောင်မြင်ပါ။ ပြန်လည်ကြိုးစားပါ။" });
  }
}
