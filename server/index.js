const express = require('express');
const { PrismaClient } = require('@prisma/client');
const redis = require('redis');
const { OpenAIApi, Configuration } = require('openai');
const bodyParser = require('body-parser');

const app = express();
const prisma = new PrismaClient();
const redisClient = redis.createClient();

const openaiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(openaiConfig);

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Node.js environment setup!');
});

// Example route to interact with OpenAI
app.post('/api/openai', async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 100,
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error interacting with OpenAI:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Example route to interact with PostgreSQL using Prisma
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Redis connection
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});