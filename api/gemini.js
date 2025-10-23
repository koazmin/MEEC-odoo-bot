// api/gemini.js
export default async function handler(req, res) {
  const { question, history } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    console.error("GEMINI_API_KEY environment variable is not set.");
    return res.status(500).json({ error: "Server configuration error: API Key is missing." });
  }

  // System prompt — defines the assistant’s behavior
  const SYSTEM_PROMPT = `မင်္ဂလာပါ။ MEEC Canteen အတွက် Odoo 17 POS ကို အသုံးပြုနေသူများအတွက် ကူညီပေးမယ့် Assistant ဖြစ်ပါတယ်။

ကျွန်တော်ရဲ့ တာဝန်မှာ Odoo 17 ရဲ့ module အားလုံး (Sales, Inventory, Purchase, Accounting, CRM, Contacts အပါအဝင်) နဲ့ပတ်သက်တဲ့ မေးခွန်းများကို ရိုးရှင်းပြီး နားလည်ရလွယ်အောင်၊ ရေရှည်အသုံးဝင်အောင် မြန်မာလိုဖြေကြားပေးဖို့ ဖြစ်ပါတယ်။

ဖြေကြားမှုများမှာ:
- တိကျသေချာပြီး
- အတိုချုံးသာမက လိုအပ်သည်များကို နမူနာနဲ့တကွ ဖြေကြားနိုင်ရန်
- ပရော်ဖက်ရှင်နယ်သဘောထားဖြင့် ကူညီမှုအရင်းအမြစ်ဖြစ်ဖို့ ရည်ရွယ်ပါတယ်။

မေးခွန်းသည် Odoo 17 နှင့် မသက်ဆိုင်ပါက —
“ကျွန်တော်က Odoo 17 အတွက်ပဲလေ့ကျင့်ထားတဲ့ Assistant ဖြစ်လို့ Odoo နှင့်ပတ်သက်တဲ့ မေးခွန်းများကိုသာ ဖြေပေးနိုင်ပါတယ်။ တခြားအကြောင်းအရာတွေအတွက် Google၊ YouTube ဒါမှမဟုတ် သက်ဆိုင်တဲ့ အကူအညီ ပေးနိုင်တဲ့သူတွေကို ဆက်သွယ်ကြည့်ပါခင်ဗျာ။” ဟု ယဉ်ကျေးစွာ ပြန်လည်ဖြေကြားပါမယ်။

အဆင့်များပြသသည့် မေးခွန်းများအတွက်တော့ တစ်ဆင့်ချင်းနည်းလမ်းများ၊ လုပ်ဆောင်ပုံနမူနာများဖြင့် လမ်းညွှန်ပေးပါမယ်။`;

  try {
    // Construct full conversation history
    let fullContents = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] }
    ];

    if (history && Array.isArray(history)) {
      const filteredHistory = history.filter(
        msg => msg.parts?.[0]?.text !== SYSTEM_PROMPT
      );
      fullContents = fullContents.concat(filteredHistory);
    }

    // Add the current question
    fullContents.push({ role: "user", parts: [{ text: question }] });

    // Use Gemini 2.5 Flash model (latest)
    const MODEL = "gemini-2.5-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: fullContents,
          generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", response.status, errorText);
      return res
        .status(response.status)
        .json({ error: `API Error from Gemini: ${response.status} - ${errorText}` });
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "မဖြေပေးနိုင်ပါ။";

    // Add the model reply to the history
    fullContents.push({ role: "model", parts: [{ text: reply }] });

    // Return the reply and updated history
    res.status(200).json({ reply, updatedHistory: fullContents });

  } catch (error) {
    console.error("Error in gemini.js handler:", error);
    res.status(500).json({ error: "✨ ဆက်သွယ်မှုမအောင်မြင်ပါ။ ပြန်လည်ကြိုးစားပါ။" });
  }
}
