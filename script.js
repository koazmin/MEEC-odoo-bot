
const API_KEY = "AIzaSyDKLen0neTJVWeeoq_MnaidQlYtPb79vMk";

async function sendMessage() {
    const userInput = document.getElementById("userInput").value;
    const responseArea = document.getElementById("responseArea");

    responseArea.textContent = "ရှာဖွေနေသည်...";
    
    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + API_KEY, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: "ကျွန်တော်က မိတ်ဆွေတို့ကို ကူညီမယ့် Odoo 17 Assistant ဖြစ်ပါတယ်။ သိချင်တာမေးပါ။ " + userInput }]
                }]
            })
        });

        const data = await response.json();
        console.log("API response:", data);

        if (data && data.candidates && data.candidates.length > 0) {
            responseArea.textContent = data.candidates[0].content.parts[0].text;
        } else {
            responseArea.textContent = "မဖြေနိုင်ပါ။";
        }
    } catch (error) {
        console.error("Error:", error);
        responseArea.textContent = "မဖြေနိုင်ပါ။";
    }
}
