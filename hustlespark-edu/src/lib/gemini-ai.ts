import { GoogleGenAI } from "@google/genai";

export interface HustleIdea {
  hustleName: string;
  description: string;
  price: number;
  aiGeneratedCopy: string;
  category: string;
  suggestedLogo: string;
}

export async function generateHustleIdeasClient(promptInterest: string): Promise<HustleIdea[]> {
  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_key_here") {
    // Fallback zero-cost service ideas if API key is not set
    return [
      {
        hustleName: "Homework Hero Helper",
        description: "Help classmates study for spelling tests and math quizzes during study hall!",
        price: 15,
        aiGeneratedCopy: "Get top grades on your next quiz with fun study sessions!",
        category: "Services",
        suggestedLogo: "📚",
      },
      {
        hustleName: "Recess Game Coach",
        description: "Teach your friends cool new tag games and referee soccer matches at recess!",
        price: 10,
        aiGeneratedCopy: "Never get bored at recess! Learn awesome new games!",
        category: "Services",
        suggestedLogo: "⚽",
      },
      {
        hustleName: "Digital Comic Creator",
        description: "Create custom digital mini-comics on your computer featuring your friends as superheroes!",
        price: 25,
        aiGeneratedCopy: "Star in your very own digital superhero comic strip!",
        category: "Digital",
        suggestedLogo: "⚡",
      },
    ];
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are a friendly business coach for kids aged 9-13.
Generate 3 fun, realistic classroom service hustle business ideas based on the student's interest: "${promptInterest || 'tutoring and games'}".

CRITICAL SERVICE-ONLY CONSTRAINT:
Only generate service-based business ideas where the student uses their existing skills, knowledge, or time to help others. Never suggest ideas that require buying materials, supplies, or equipment. Examples of good ideas: tutoring, teaching a skill, performing a service, creating digital content. Examples of bad ideas: selling handmade crafts, baking, making physical products.

IMPORTANT INSTRUCTIONS:
- Write for a 9-year-old level. Use short sentences, no business jargon, and a super fun and encouraging tone!
- Respond strictly with valid JSON array containing exactly 3 objects.
- Each object must have fields:
  - "hustleName": catchy name
  - "description": 2 short sentences explaining what service the student provides
  - "price": integer between 10 and 50 (classroom currency)
  - "aiGeneratedCopy": a fun 1-sentence sales pitch for classmates
  - "category": one of ["Services", "Digital", "Fun"]
  - "suggestedLogo": single emoji character representing the hustle

Format output as JSON inside \`\`\`json block.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text || "";
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1] || jsonMatch[0]) as HustleIdea[];
  }

  throw new Error("Failed to parse AI response into JSON ideas.");
}
