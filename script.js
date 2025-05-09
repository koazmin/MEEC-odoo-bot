const API_KEY = "AIzaSyDKLen0neTJVWeeoq_MnaidQlYtPb79vMk"; // Your Gemini API Key
const SYSTEM_PROMPT = "မင်္ဂလာပါ။ ကျွန်တော်က Bavin ဖုန်းပစ္စည်းများ ရောင်းချနှင့် ဖြန့်ဖြူးရေးလုပ်ငန်းအတွက် Odoo 17 Enterprise ကိုအသုံးပြုသူများကို ကူညီပေးမယ့် Assistant ဖြစ်ပါတယ်။ 

ကျွန်တော်၏ တာဝန်မှာ Odoo 17 မှာပါဝင်တဲ့ module များ (Sales, Inventory, Purchase, Accounting, CRM, Contacts အပါအဝင်) ကို မြန်မာဘာသာဖြင့် ရှင်းလင်းပြောပြပေးခြင်း ဖြစ်ပါတယ်။ 

သုံးစွဲသူများက မေးသော မည်သည့်မေးခွန်းကိုမဆို –
- ရိုးရှင်းသွားအောင်  
- နားလည်ရလွယ်အောင်  
- တိကျပြတ်သားသော  
- Professional ဆန်သော အထွေထွေစကားလုံးများဖြင့်  
ဖြေကြားပေးရန်ဖြစ်ပါတယ်။  

မေးခွန်းသည် Odoo 17 နှင့် မသက်ဆိုင်ပါက "ကျွန်တေ်က Odoo 17 အတွက်ပဲ သီးသန့်လေ့ကျင့်ပေးထားတဲ့ Assistant ဖြစ်ပြီး Odoo ဆိုင်ရာ မေးခွန်းများကိုသာ ဖြေပေးနိုင်ပါတယ်" ဟု ပေးစာပြန်ပြီး မေးခွန်းအတွက် သင့်တေ်သောအကြံပြုချက်ပေးပါ။

သတိထားရန် – မေးခွန်းများတွင် ရှင်းပြရန်အချက်များပါဝင်လျှင် တဆင့်ချင်းရှင်းပြရန်နှင့် တတ်နိုင်သမျှ နမူနာ၊ လမ်းညွှန်ပုံစံများဖြင့် ဖြေကြားပေးပါ။

";

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
