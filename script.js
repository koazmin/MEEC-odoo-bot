
const API_KEY = "AIzaSyDKLen0neTJVWeeoq_MnaidQlYtPb79vMk";
const MODEL = "models/gemini-pro";
const SYSTEM_PROMPT = "ကျွန်တော်က မိတ်ဆွေတို့ကို ကူညီမယ့် Odoo 17 Assistant ဖြစ်ပါတယ်။ Odoo 17 ERP အကြောင်းသိချင်တာမေးပါ။";

async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value;
  if (!message) return;

  const chatBox = document.getElementById("messages");
  const userMessage = document.createElement("div");
  userMessage.className = "message user";
  userMessage.textContent = message;
  chatBox.appendChild(userMessage);
  input.value = "";

  const botMessage = document.createElement("div");
  botMessage.className = "message bot";
  botMessage.textContent = "စစ်ဆေးနေသည်...";
  chatBox.appendChild(botMessage);

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\nUser: " + message }] }]
      })
    });

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "ဖြေဆို၍မရပါ။ ကျေးဇူးပြု၍ မေးခွန်းကို ပြန်စဉ်းစားပါ။";
    botMessage.textContent = text;
  } catch (error) {
    botMessage.textContent = "အမှားတခု ဖြစ်ပွားခဲ့သည်။";
    console.error(error);
  }
}
