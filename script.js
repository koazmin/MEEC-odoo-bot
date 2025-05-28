// script.js
const messagesDiv = document.getElementById("messages");
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton'); // Assuming you have a send button

// Store conversation history on the client side
// This will be sent to the server with each request to maintain context
let clientConversationHistory = [];

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
            // Attempt to parse error message from server
            const errorData = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(errorData.error || `API Error: ${response.status}`);
        }

        const data = await response.json();
        const reply = data.reply || "✨ မဖြေပေးနိုင်ပါ။";

        // IMPORTANT: Update client-side history with the latest history provided by the server.
        // The server sends back `updatedHistory` which includes the system prompt + all turns.
        if (data.updatedHistory && Array.isArray(data.updatedHistory)) {
            clientConversationHistory = data.updatedHistory;
            // Optionally, save to localStorage for persistence across browser sessions:
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
    messageContainer.innerHTML = (sender === 'user' ? " 👨‍💼 " : " ✨ ") + escapeHtml(message); // Using innerHTML for potential Markdown, escape to prevent XSS
    messagesDiv.appendChild(messageContainer);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to bottom
}

// Typing animation for bot message
function animateBotReply(text) {
    // Find the latest bot message (which is currently the loading message)
    const botMessages = messagesDiv.querySelectorAll('.message.bot');
    if (botMessages.length === 0) return;

    const messageElement = botMessages[botMessages.length - 1];
    let index = 0;
    const prefix = "✨ ";

    // Clear the loading message and start typing
    messageElement.textContent = prefix;

    const typingInterval = setInterval(() => {
        if (index < text.length) {
            messageElement.textContent += text.charAt(index);
            index++;
            messagesDiv.scrollTop = messagesDiv.scrollHeight; // Keep scrolling while typing
        } else {
            clearInterval(typingInterval);
        }
    }, 10); // Adjust typing speed here (ms per character)
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

// Add event listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default Enter key behavior (e.g., new line)
        sendMessage();
    }
});

// Optional: Load history from localStorage on page load
// This allows chat history to persist even if the user closes and reopens the tab/browser.
document.addEventListener('DOMContentLoaded', () => {
    const storedHistory = localStorage.getItem('chatHistory');
    if (storedHistory) {
        try {
            clientConversationHistory = JSON.parse(storedHistory);
            // Optionally, you can re-display past messages here,
            // but for simplicity, we'll just load the history for sending.
            // Be careful if the history includes the system prompt, as you don't want to display it.
        } catch (e) {
            console.error("Failed to parse stored chat history:", e);
            localStorage.removeItem('chatHistory'); // Clear invalid history
        }
    }
});
