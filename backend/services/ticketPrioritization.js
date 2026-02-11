const { OpenAIApi, Configuration } = require("openai");
const { PrismaClient } = require("@prisma/client");
const Redis = require("ioredis");

const prisma = new PrismaClient();
const redis = new Redis();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function prioritizeTickets() {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { status: 'open' },
    });

    const ticketPrioritizationPromises = tickets.map(async (ticket) => {
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Prioritize this support ticket based on its content: ${ticket.content}`,
        max_tokens: 10,
      });

      const priority = response.data.choices[0].text.trim();
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { priority },
      });

      // Store the priority in Redis for quick access
      await redis.set(`ticket:${ticket.id}:priority`, priority);
    });

    await Promise.all(ticketPrioritizationPromises);
  } catch (error) {
    console.error("Error prioritizing tickets:", error);
  }
}

module.exports = {
  prioritizeTickets,
};