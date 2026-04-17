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
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
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
            'You are a helpful AI assistant. Keep answers clear, concise, and user-friendly.',
        },
        {
          role: 'user',
          content: prompt,
        },
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