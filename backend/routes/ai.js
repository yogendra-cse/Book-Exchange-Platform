const express = require("express");
const router = express.Router();
const axios = require("axios");
require('dotenv').config();
router.post("/summary", async (req, res) => {
  try {
    const { title } = req.body;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "user",
            content: `Give info about the book and Write a small summary of 2 lines for the book: ${title} just give the summary dont add the title author and other stuff`

          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const text = response.data.choices[0].message.content;

    res.json({ summary: text });

  } catch (err) {
    res.status(500).json({ message: "AI failed" });
  }
});

module.exports = router;