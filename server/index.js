const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

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

    return res.json({
      reply: `Placeholder response for: ${prompt}`
    });
  } catch (error) {
    console.error('Chat route error:', error);
    return res.status(500).json({ error: 'Something went wrong on the server' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});