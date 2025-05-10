const API_KEY = "AIzaSyDKLen0neTJVWeeoq_MnaidQlYtPb79vMk"; // Your Gemini API Key

const SYSTEM_PROMPT = `မင်္ဂလာပါ။ Bavin Myanmar အတွက် နည်းပညာအကူအညီပေးမယ့် Assistant ဖြစ်ပါတယ်။

ကျွန်ုပ်၏ အဓိက လုပ်ငန်းဆောင်တာမှာ Bavin ဖုန်းဆက်စပ်ပစ္စည်းများနှင့် ပတ်သက်သော နည်းပညာဆိုင်ရာ မေးခွန်းများကို တိကျရှင်းလင်းစွာ မြန်မာဘာသာဖြင့် ဖြေကြားရန် ဖြစ်ပါသည်။ 

ကျွမ်းကျင်နယ်ပယ်
ကျွန်ုပ်၏ ကျွမ်းကျင်မှုသည် Bavin ထုတ်ကုန်များနှင့် ၎င်းတို့အသုံးပြုသော နည်းပညာများပေါ်တွင် အဓိက တည်ရှိပါသည်။ ဖုန်းဆက်စပ်ပစ္စည်းများနှင့် အားသွင်းစံနှုန်းများဆိုင်ရာ အထွေထွေဗဟုသုတကို အသုံးပြုနိုင်သော်လည်း၊ ဖြစ်နိုင်ပါက Bavin ၏ ထုတ်ကုန်လိုင်းနှင့် မည်သို့သက်ဆိုင်သည်ကို အမြဲတမ်း ဆက်စပ်ဖော်ပြပါမည်။
`;

const messagesDiv = document.getElementById("messages");

async function sendMessage() {
  const userInput = document.getElementById('userInput');
  const question = userInput.value.trim();
  if (!question) return;

  displayMessage(question, 'user');
  userInput.value = "";

  displayMessage("မေးခွန်းကိုဖြေဖို့ကြိုးစားနေပါတယ်...", 'bot');

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
    const reply = data.reply || "✨ မဖြေပေးနိုင်ပါ။";
    animateBotReply(reply);
  } catch (error) {
    animateBotReply("✨ ဆက်သွယ်မှုမအောင်မြင်ပါ။ ပြန်လည်ကြိုးစားပါ။");
    console.error("Error:", error);
  }
}

function displayMessage(message, sender) {
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message', sender);
  messageContainer.textContent = (sender === 'user' ? " 👨‍💼 " : " ✨ ") + message;
  messagesDiv.appendChild(messageContainer);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function animateBotReply(text) {
  const botMessages = messagesDiv.querySelectorAll('.message.bot');
  if (botMessages.length === 0) return;

  const messageElement = botMessages[botMessages.length - 1];
  let index = 0;
  const prefix = "✨ ";

  messageElement.textContent = prefix;

  const typingInterval = setInterval(() => {
    if (index < text.length) {
      messageElement.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(typingInterval);
    }
  }, 7);
}

function scrollToBottom() {
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
