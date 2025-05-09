const messagesDiv = document.getElementById("messages");

async function sendMessage() {
  const userInput = document.getElementById('userInput');
  const question = userInput.value.trim();
  if (!question) return;

  displayMessage(question, 'user');
  userInput.value = "";

  displayMessage("🤖 မေးခွန်းကိုဖြေဖို့ကြိုးစားနေပါတယ်...", 'bot');

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });

    if (!response.ok) throw new Error("API Error");

    const data = await response.json();
    updateBotMessage(data.reply || "🤖 မဖြေနိုင်ပါ။");
  } catch (e) {
    updateBotMessage("🤖 ဆက်သွယ်မှုမအောင်မြင်ပါ။ ပြန်လည်ကြိုးစားပါ။");
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
}