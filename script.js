const API_KEY = "AIzaSyDKLen0neTJVWeeoq_MnaidQlYtPb79vMk"; // Your Gemini API Key
const SYSTEM_PROMPT = "ကျွန်တော်က မိတ်ဆွေတို့ကို ကူညီမယ့် Odoo 17 Assistant ဖြစ်ပါတယ်။ Odoo 17 ERP အကြောင်းသိချင်တာမေးပါ။";

const messagesDiv = document.getElementById("messages");

async function sendMessage() {
  const userInput = document.getElementById('userInput');
  const question = userInput.value.trim();
  if (!question) return;

  // Display user's message using displayMessage function
  displayMessage(question, 'user');
  
  // Clear input field
  userInput.value = "";

  // Show loading message while waiting for the bot response
  displayMessage("🤖 မေ့လျော့နေပါတယ်...", 'bot');

  try {
    // Send question to Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: SYSTEM_PROMPT + "\n\nမေးခွန်း: " + question }
              ]
            }
          ]
        })
      }
    );

    // Check if the response is valid
    if (!response.ok) {
      throw new Error("API Error: " + response.statusText);
    }

    const data = await response.json();

    // Extract the reply from the response or fallback to error message
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "🤖 မဖြေနိုင်ပါ။";
    // Update the bot message
    updateBotMessage(reply);
  } catch (error) {
    // In case of an error, show an error message
    updateBotMessage("🤖 ဆက်သွယ်မှုအမှား ဖြစ်နေပါသည်။ ပြန်လည်ကြိုးစားပါ။");
    console.error("Error:", error);
  }
}

// Function to display user or bot message
function displayMessage(message, sender) {
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message');
  messageContainer.classList.add(sender); // Add class for bot or user
  
  messageContainer.textContent = (sender === 'user' ? "🧑 " : "🤖 ") + message;
  messagesDiv.appendChild(messageContainer);
  
  // Scroll to the bottom of the chat
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Function to update the bot's message after API response
function updateBotMessage(text) {
  const botMessages = messagesDiv.querySelectorAll('.message.bot');
  if (botMessages.length > 0) {
    // Update the last bot message
    botMessages[botMessages.length - 1].textContent = "🤖 " + text;
  }
  scrollToBottom();
}

// Scroll to the bottom of the messages
function scrollToBottom() {
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
