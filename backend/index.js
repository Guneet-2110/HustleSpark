import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generate", async (req, res) => {
const { interests } = req.body;

const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
method: "POST",
headers: {
"Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
"Content-Type": "application/json"
},
body: JSON.stringify({
model: "gpt-3.5-turbo",
messages: [
{ role: "system", content: "You are a startup hustle coach." },
{ role: "user", content: `Give 3 simple side hustles a teen can start who likes: ${interests}` }
]
})
});

const data = await response.json();
const ideas = data.choices?.[0]?.message?.content?.split("\n").filter(line => line.trim());
res.json({ ideas });
});

// Render requires PORT to be dynamic
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

