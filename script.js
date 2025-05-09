const API_KEY = "AIzaSyDKLen0neTJVWeeoq_MnaidQlYtPb79vMk"; // Your Gemini API Key

const SYSTEM_PROMPT = `မင်္ဂလာပါ။ Bavin Myanmar အတွက် Odoo 17 Enterprise ကို အသုံးပြုနေသူများအတွက် ကူညီပေးမယ့် Assistant ဖြစ်ပါတယ်။

ကျွန်တော်ရဲ့ တာဝန်မှာ Odoo 17 ရဲ့ module အားလုံး (Sales, Inventory, Purchase, Accounting, CRM, Contacts အပါအဝင်) နဲ့ပတ်သက်တဲ့ မေးခွန်းများကို ရိုးရှင်းပြီး နားလည်ရလွယ်အောင်၊ ရေရှည်အသုံးဝင်အောင် မြန်မာလိုဖြေကြားပေးဖို့ ဖြစ်ပါတယ်။

ဖြေကြားမှုများမှာ:
- တိကျသေချာပြီး
- အတိုချုံးသာမက လိုအပ်သည်များကို နမူနာနဲ့တကွ ဖြေကြားနိုင်ရန်
- ပရော်ဖက်ရှင်နယ်သဘောထားဖြင့် ကူညီမှုအရင်းအမြစ်ဖြစ်ဖို့ ရည်ရွယ်ပါတယ်။

မေးခွန်းသည် Odoo 17 နှင့် မသက်ဆိုင်ပါက —  
“ကျွန်တော်က Odoo 17 Assistant ဖြစ်ပါတယ်။ Odoo နှင့်ပတ်သက်သော မေးခွန်းများကိုသာ ဖြေပေးနိုင်ပါတယ်။ အခြားအကြောင်းအရာများအတွက် Google၊ YouTube သို့မဟုတ် သက်ဆိုင်ရာ support ပေးသူများထံတွင် ဆက်သွယ်ကြည့်ပါ။” ဟု ယဉ်ကျေးစွာ ပြန်လည်ဖြေကြားပါမယ်။

အဆင့်များပြသသည့် မေးခွန်းများအတွက်တော့ တစ်ဆင့်ချင်းနည်းလမ်းများ၊ လုပ်ဆောင်ပုံနမူနာများဖြင့် လမ်းညွှန်ပေးပါမယ်။`;

const messagesDiv = document.getElementById("messages");

async function sendMessage() {
  const userInput = document.getElementById('userInput');
  const question = userInput.value.trim();
  if (!question) return;

  displayMessage(question, 'user');
  userInput.value = "";

  // Show a loading message from the bot
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
    const reply = data.reply || "🤖✨ မဖြေပေးနိုင်ပါ။";
    animateBotReply(reply);
  } catch (error) {
    animateBotReply("🤖✨ ဆက်သွယ်မှုမအောင်မြင်ပါ။ ပြန်လည်ကြိုးစားပါ။");
    console.error("Error:", error);
  }
}

function displayMessage(message, sender) {
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message', sender);
  messageContainer.textContent = (sender === 'user' ? "🧑‍💻 " : "🤖✨ ") + message;
  messagesDiv.appendChild(messageContainer);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Typing animation for bot message
function animateBotReply(text) {
  const botMessages = messagesDiv.querySelectorAll('.message.bot');
  if (botMessages.length === 0) return;

  const messageElement = botMessages[botMessages.length - 1];
  let index = 0;
  const prefix = "🤖✨ ";

  messageElement.textContent = prefix;

  const typingInterval = setInterval(() => {
    if (index < text.length) {
      messageElement.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(typingInterval);
    }
  }, 25); // Adjust typing speed here (ms per character)
}

function scrollToBottom() {
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
