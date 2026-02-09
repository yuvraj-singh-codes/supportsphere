const { PrismaClient } = require('@prisma/client');
const { OpenAIApi, Configuration } = require('openai');
const Redis = require('ioredis');

const prisma = new PrismaClient();
const redis = new Redis();
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

async function prioritizeTicket(ticketId) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const sentimentAnalysis = await analyzeSentiment(ticket.description);
    const urgencyScore = calculateUrgencyScore(ticket);

    const priority = determinePriority(sentimentAnalysis, urgencyScore);

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { priority },
    });

    await redis.set(`ticket:${ticketId}:priority`, priority);

    return { ticketId, priority };
  } catch (error) {
    console.error('Error prioritizing ticket:', error);
    throw new Error('Failed to prioritize ticket');
  }
}

async function analyzeSentiment(description) {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `Analyze the sentiment of the following text: "${description}"` }],
    });

    const sentiment = response.data.choices[0].message.content.trim();
    return sentiment;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw new Error('Sentiment analysis failed');
  }
}

function calculateUrgencyScore(ticket) {
  let score = 0;
  if (ticket.isCritical) score += 5;
  if (ticket.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000)) score += 3; // Older than 24 hours
  if (ticket.customerType === 'premium') score += 2;
  return score;
}

function determinePriority(sentiment, urgencyScore) {
  if (sentiment.includes('urgent') || urgencyScore >= 5) {
    return 'high';
  } else if (urgencyScore >= 3) {
    return 'medium';
  } else {
    return 'low';
  }
}

module.exports = { prioritizeTicket };