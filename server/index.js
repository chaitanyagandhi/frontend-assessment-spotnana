const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    const formattedMessages = messages
      .filter(
        (message) =>
          message &&
          typeof message.content === 'string' &&
          message.content.trim() &&
          (message.role === 'user' || message.role === 'assistant')
      )
      .map((message) => ({
        role: message.role,
        content: message.content.trim(),
      }));

    if (formattedMessages.length === 0) {
      return res.status(400).json({ error: 'Valid messages are required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Missing OpenAI API key' });
    }

    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content:
            'You are a helpful AI assistant. Keep answers clear, concise, and user-friendly. Respond in plain text only. Do not use markdown, bold formatting, bullet symbols, numbered markdown lists, headings, code fences, or asterisks. Use simple plain text with short paragraphs or simple numbering like 1) 2) 3) when needed.',
        },
        ...formattedMessages,
      ],
    });

    const reply =
      response.output_text || 'Sorry, I could not generate a response.';

    return res.json({ reply });
  } catch (error) {
    console.error('OpenAI API error:', error);

    return res.status(500).json({
      error: 'Failed to generate AI response',
    });
  }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});