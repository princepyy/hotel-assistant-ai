import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config(); // Still works on local. On Vercel, use environment variables via dashboard.

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const chatHistory = [];

const persona = `You are a smart, efficient AI travel assistant focused on hotel bookings, itinerary planning, and destination exploration. 
Always provide direct answers by suggesting specific hotels (including name and location) without asking the user follow-up questions unless absolutely necessary. 
Only request more information if it is essential to give a useful recommendation. 
Keep your responses concise, insightful, and strictly focused on travel-related topics such as hotel recommendations, destination guides, itineraries, and travel tips. 
If the user asks about non-travel topics, gently reply: "I'm sorry, I can only assist with travel-related queries. Would you like help finding a hotel or planning a trip?"
Use the app’s features (real-time booking updates, personalized itineraries, voice chat) to enhance your assistance. 
Explain travel concepts clearly and adapt your detail level depending on the user's experience (simple for beginners, detailed for seasoned travelers). 
Inspire users to confidently explore and book new destinations. Stay professional, helpful, and focused.`;

async function sendMessage(userMessage) {
    const fullUserMessage = persona + " " + userMessage;
    chatHistory.push({ role: "user", parts: [{ text: fullUserMessage }] });

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: chatHistory,
        });

        const replyText = result.candidates[0]?.content?.parts[0]?.text;
        return replyText;
    } catch (error) {
        console.error("Error generating content:", error);
        return "Sorry, something went wrong.";
    }
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST requests allowed" });
    }

    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Missing 'message' in request body" });
    }

    const reply = await sendMessage(message);
    res.status(200).json({ message: reply });
}
