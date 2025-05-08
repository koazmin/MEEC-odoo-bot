const API_KEY = "YOUR_GEMINI_API_KEY"; // Replace with your actual Gemini API key

const SYSTEM_PROMPT = `
သင်မှာ Bavin ဖုန်းအပိုပစ္စည်းများကို လက်ကား/စတိုးရောင်းဝယ်လုပ်ငန်းဖြင့် လုပ်ကိုင်နေပြီး Odoo 17 Enterprise ကို အသုံးပြုပြီး Sales, Inventory, Purchase, Accounting, CRM, Contacts စတဲ့ module တွေနဲ့ လုပ်ငန်းကို စနစ်တကျစီမံခန့်ခွဲနေပါတယ်။ 
ကျွန်တော်က သင်ရဲ့ Assistant ဖြစ်ပြီး မြန်မာဘာသာနဲ့ ရိုးရှင်းလွယ်ကူတဲ့စကားလုံးတွေနဲ့ ပရော်ဖက်ရှင်နယ်နည်းဖြင့် မေးတဲ့ module နဲ့ပတ်သက်တဲ့အကြောင်းအရာတွေကို အကြောင်းအရာပြည့်စုံနဲ့ ပြန်ဖြေမှာပါ။ 
`;

let conversationHistory = [];

function displayMessage(message, sender) {
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message', sender);
  messageContainer.textContent = message;
  document.getElementById('messages').appendChild(messageContainer);
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}

function updateBotMessage(content) {
  const allMessages = document.querySelectorAll('.bot');
  const latestBotMessage = allMessages[allMessages.length - 1];
  if (latestBotMessage) {
    latestBotMessage.textContent = content;
  }
}

async function sendMessage() {
  const inputField = document.getElementById('userInput');
  const question = inputField.value.trim();
  if (!question) return;

  displayMessage(question, 'user');
  inputField.value = "";
  displayMessage("🤖 ပြန်လည်တွေးခေါ်နေပါတယ်...", 'bot');

  conversationHistory.push({ role: "user", parts: [{ text: question }] });

  const requestBody = {
    contents: [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      ...conversationHistory.slice(-5)
    ]
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      }
    );

    const data = await response.json();
    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "🤖 မဖြေနိုင်ပါ။";
    conversationHistory.push({ role: "model", parts: [{ text: botReply }] });
    updateBotMessage(botReply);
  } catch (error) {
    updateBotMessage("🤖 ပြဿနာတစ်ခု ဖြစ်နေပါသည်။");
  }
}

function startVoiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'my-MM';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const voiceText = event.results[0][0].transcript;
    document.getElementById('userInput').value = voiceText;
    sendMessage();
  };

  recognition.onerror = (event) => {
    alert("အသံဖမ်းရန်မအောင်မြင်ပါ။: " + event.error);
  };

  recognition.start();
}
