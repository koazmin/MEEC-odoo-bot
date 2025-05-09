const API_KEY = "AIzaSyDKLen0neTJVWeeoq_MnaidQlYtPb79vMk"; // Your Gemini API Key
const SYSTEM_PROMPT = "ကျွန်တော်က မိတ်ဆွေတို့ကို ကူညီမယ့် Odoo 17 Assistant ဖြစ်ပါတယ်။ Odoo 17 ERP အကြောင်းသိချင်တာမေးပါ။";

const messagesDiv = document.getElementById("messages");

async function sendMessage() {
  const userInput = document.getElementById('userInput');
  const question = userInput.value.trim();
  if (!question) return;

  displayMessage(question, 'user');
  userInput.value = "";
  displayMessage("🤖 မေးခွန်းကိုဖြေဖို့ကြိုးစားနေပါတယ်...", 'bot');

  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: SYSTEM_PROMPT + "\n\nမေးခွန်း: " + question
      })
    });

    if (!response.ok) {
      throw new Error("API Error: " + response.statusText);
    }

    const data = await response.json();
    const reply = data.reply || "🤖 မဖြေနိုင်ပါ။";
    updateBotMessage(reply);
  } catch (error) {
    updateBotMessage("🤖 ဆက်သွယ်မှုမအောင်မြင်ပါ။ ပြန်လည်ကြိုးစားပါ။");
    console.error("Error:", error);
  }
}

function displayMessage(message, sender) {
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message', sender);
  messageContainer.textContent = (sender === 'user' ? "🧑 " : "🤖 ") + message;
  messagesDiv.appendChild(messageContainer);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function updateBotMessage(text) {
  const botMessages = messagesDiv.querySelectorAll('.message.bot');
  if (botMessages.length > 0) {
    botMessages[botMessages.length - 1].textContent = "🤖 " + text;
  }
  scrollToBottom();
}

function scrollToBottom() {
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
