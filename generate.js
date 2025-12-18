const fs = require("fs");
const fetch = require("node-fetch");

const topics = JSON.parse(fs.readFileSync("topics.json", "utf-8"));
const topic = topics.shift();

if (!topic) {
  console.log("No topics left");
  process.exit(0);
}

const prompt = `
You are a senior backend engineer writing a deep technical Medium article.

Topic: ${topic}

Audience:
- Experienced software engineers (3–10 years)
- Backend / System design focused

Guidelines:
- Start with a real-world problem that engineers face
- Build a mental model before details
- Explain internals step-by-step
- Include at least 1 realistic production example
- Explicitly call out tradeoffs and limitations
- Avoid textbook definitions
- No marketing or generic AI tone

Structure:
1. Why this problem exists
2. Core concept (mental model)
3. Internal mechanics
4. Real-world example
5. Common misconceptions
6. Tradeoffs & when NOT to use it
7. Interview perspective

End with:
- Key takeaways (bullets)
- 3 system design interview questions

Length: 1200–1500 words`;

async function generate() {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }]
      })
    }
  );

  const data = await response.json();

  if (!data.choices || !data.choices.length) {
    console.error("Groq API Error Response:");
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const content = data.choices[0].message.content;

  const date = new Date().toISOString().split("T")[0];
  const fileName = `drafts/${date}-${topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}.md`;

  fs.writeFileSync(fileName, content);
  fs.writeFileSync("topics.json", JSON.stringify(topics, null, 2));

  console.log(`Draft created: ${fileName}`);
}

generate();
