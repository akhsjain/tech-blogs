const fs = require("fs");
const fetch = require("node-fetch");

const topics = JSON.parse(fs.readFileSync("topics.json", "utf-8"));
const topic = topics.shift();

if (!topic) {
  console.log("No topics left");
  process.exit(0);
}

const prompt = `
You are a senior backend engineer writing a deep technical Medium blog.

Topic: ${topic}

Audience:
- Experienced developers (3–8 years)
- System design interview preparation

Rules:
- Explain internal mechanics
- Use real-world examples
- Discuss tradeoffs
- Avoid generic explanations
- Clear headings
- 1200–1500 words

End with:
- Key takeaways
- 3 interview questions
`;

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
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content: prompt }]
      })
    }
  );

  const data = await response.json();
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
