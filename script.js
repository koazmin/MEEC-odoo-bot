const API_KEY = "AIzaSyDKLen0neTJVWeeoq_MnaidQlYtPb79vMk"; // your Gemini API key
const SYSTEM_PROMPT = "ကျွန်တော်က မိတ်ဆွေတို့ကို ကူညီမယ့် Odoo 17 Assistant ဖြစ်ပါတယ်။ Odoo 17 ERP အကြောင်းသိချင်တာမေးပါ။";

const messagesDiv = document.getElementById("messages");

async function sendMessage() {
  const userInput = document.getElementById("userInput");
  const question = userInput.value.trim();
  if (!question) return;

  appendMessage("user", question);
  userInput.value = "";

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
          { role: "user", parts: [{ text: question }] },
        ],
      }),
    }
  );

  const data = await response.json();

  try {
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "မဖြေနိုင်ပါ။";
    appendMessage("bot", reply);
  } catch (e) {
    appendMessage("bot", "မဖြေနိုင်ပါ။");
  }
}

function appendMessage(role, text) {
  const div = document.createElement("div");
  div.className = "message " + role;
  div.textContent = (role === "user" ? "🧑 " : "🤖 ") + text;
  messagesDiv.appendChild(div);
}
