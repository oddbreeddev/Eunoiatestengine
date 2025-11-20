import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Securely loaded from Netlify settings
});

export const handler = async (event) => {
  // Security: Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { scores, interest } = JSON.parse(event.body);

    // The Prompt: Bringing in the Ikigai Concept
    const prompt = `
      You are an expert career counselor using the Ikigai framework.
      
      User Profile:
      - Interest (What they love): ${interest}
      - Personality Scores (What they are good at): 
        Openness: ${scores.O}, Conscientiousness: ${scores.C}, Extraversion: ${scores.E}, Agreeableness: ${scores.A}, Neuroticism: ${scores.N} (Scale 1-5).

      Task:
      Analyze this profile and return a JSON object with this specific structure:
      {
        "archetype": "A creative 2-3 word title (e.g. The Empathetic Architect)",
        "temperament_description": "A 2-sentence summary of their temperament.",
        "ikigai_statement": "A powerful statement combining their passion for ${interest} with their personality strengths.",
        "strengths": ["Strength 1", "Strength 2", "Strength 3"],
        "weaknesses": ["Weakness 1", "Weakness 2"],
        "career_paths": [
          {
            "role": "Job Title 1",
            "why": "Why it fits their Ikigai."
          },
           {
            "role": "Job Title 2",
            "why": "Why it fits their Ikigai."
          }
        ]
      }
      Return ONLY raw JSON.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: "You are a helpful JSON generator." }, { role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return {
      statusCode: 200,
      body: completion.choices[0].message.content
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};