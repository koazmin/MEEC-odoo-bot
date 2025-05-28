// script.js
const messagesDiv = document.getElementById("messages");
const userInput = document.getElementById('userInput');
const sendButton = document.querySelector('button'); // Select the button element

// Store conversation history on the client side
let clientConversationHistory = [];

// Initial bot welcome message
const welcomeMessage = "✨မင်္ဂလာပါခင်ဗျာ။ ကျွန်တော်က မိတ်ဆွေတို့ကို ကူညီမယ့် Bavin Myanmar ရဲ့ Odoo 17 Assistant ဖြစ်ပါတယ်။ Odoo 17 ERP အကြောင်းသိချင်တာမေးလို့ရပါတယ်။";

// Function to send message (triggered by button click or Enter key)
async function sendMessage() {
    const question = userInput.value.trim();
    if (!question) return; // Don't send empty messages

    displayMessage(question, 'user'); // Display user's message immediately
    userInput.value = ""; // Clear input field

    // Show a loading message from the bot
    displayMessage("မေးခွန်းကိုဖြေဖို့ကြိုးစားနေပါတယ်...", 'bot');

    try {
        const response = await fetch("/api/gemini", { // Call your Vercel serverless function
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                question: question,
                history: clientConversationHistory // Send the current history for context
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(errorData.error || `API Error: ${response.status}`);
        }

        const data = await response.json();
        const reply = data.reply || "✨ မဖြေပေးနိုင်ပါ။";

        if (data.updatedHistory && Array.isArray(data.updatedHistory)) {
            clientConversationHistory = data.updatedHistory;
            // You can optionally save to localStorage here for persistence across browser sessions:
            // localStorage.setItem('chatHistory', JSON.stringify(clientConversationHistory));
        }

        animateBotReply(reply); // Animate the bot's reply

    } catch (error) {
        console.error("Error:", error);
        animateBotReply(`✨ ဆက်သွယ်မှုမအောင်မြင်ပါ။ ပြန်လည်ကြိုးစားပါ။ (${error.message})`);
    }
}

// Function to display messages in the chat interface
function displayMessage(message, sender) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message', sender);
    messageContainer.innerHTML = (sender === 'user' ? " 👨‍💼 " : " ✨ ") + escapeHtml(message);
    messagesDiv.appendChild(messageContainer);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to bottom
}

// Typing animation for bot message
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
            messagesDiv.scrollTop = messagesDiv.scrollHeight; // Keep scrolling while typing
        } else {
            clearInterval(typingInterval);
        }
    }, 10);
}

// Helper function to escape HTML for display
function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Event listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});

// IMPORTANT: Display the initial welcome message when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Optionally, load history from localStorage if you want persistence across browser sessions.
    const storedHistory = localStorage.getItem('chatHistory');
    if (storedHistory) {
        try {
            // If you load history, you might want to reconstruct the chat UI
            // However, be careful not to include the SYSTEM_PROMPT in display or future API calls from client
            const parsedHistory = JSON.parse(storedHistory);
            clientConversationHistory = parsedHistory;

            // Display previous messages (excluding the system prompt)
            parsedHistory.forEach(msg => {
                if (msg.parts !== welcomeMessage && msg.role !== 'system') { // Ensure system prompt isn't displayed
                    displayMessage(msg.parts, msg.role);
                }
            });

            // If no history, or first time, display the welcome message
            if (clientConversationHistory.length <= 1) { // 1 means only the system prompt
                 displayMessage(welcomeMessage, 'bot');
            }

        } catch (e) {
            console.error("Failed to parse stored chat history:", e);
            localStorage.removeItem('chatHistory'); // Clear invalid history
            displayMessage(welcomeMessage, 'bot'); // Display welcome if error
        }
    } else {
        // If no history found, display the initial welcome message
        displayMessage(welcomeMessage, 'bot');
    }
});
