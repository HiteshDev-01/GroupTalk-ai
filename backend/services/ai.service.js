import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `
  If the input requests code, respond in this JSON format:

  {
    "fileTree": {
      "filename.js": {
        file: {
        "contents": [
          "const express = require('express');",
          "const app = express();",
          "const port = 5000;",
          "",
          "// Middleware to handle JSON data",
          "app.use(express.json());",
          "",
          "// Example route",
          "app.get('/api/hello', (req, res) => {",
          "  res.json({ message: 'Hello from the server!' });",
          "});",
          "",
          "// Error handling middleware",
          "app.use((err, req, res, next) => {",
          "  console.error(err.stack);",
          "  res.status(500).send('Something broke!');",
          "});",
          "",
          "app.listen(port, () => {",
          "  console.log(\`Server listening on port \${port}\`);",
          "});"
        ]
      }
    }
  }
}

  - Ensure all code responses are wrapped in valid JSON format.
  - Non-code inputs must be answered in plain text.
`
});

export const generateResult = async (prompt) => {
  const result = await model.generateContent(prompt);
  return result.response.text();
}