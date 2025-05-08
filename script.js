const API_KEY = "AIzaSyDKLen0neTJVWeeoq_MnaidQlYtPb79vMk";

async function sendMessage() {
  const input = document.getElementById("input");
  const message = input.value.trim();
  if (!message) return;

  const chat = document.getElementById("chat");

  // Show user message
  const userDiv = document.createElement("div");
  userDiv.className = "bubble user";
  userDiv.textContent = message;
  chat.appendChild(userDiv);

  input.value = "";

  // Show loading message
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "bubble bot";
  loadingDiv.textContent = "ဖြေနေသည်...";
  chat.appendChild(loadingDiv);

  // Gemini API call
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
      }),
    });

    const data = await res.json();
    loadingDiv.remove();

    const botDiv = document.createElement("div");
    botDiv.className = "bubble bot";
    botDiv.textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "မဖြေနိုင်ပါ။";
    chat.appendChild(botDiv);

  } catch (e) {
    loadingDiv.remove();
    const errorDiv = document.createElement("div");
    errorDiv.className = "bubble bot";
    errorDiv.textContent = "အမှားအယွင်း ဖြစ်ပွားခဲ့သည်။";
    chat.appendChild(errorDiv);
  }
}
