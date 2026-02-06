import { useEffect, useState } from 'react';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const redis = new Redis();

export default function Home() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const cachedTickets = await redis.get('tickets');
        if (cachedTickets) {
          setTickets(JSON.parse(cachedTickets));
        } else {
          const fetchedTickets = await prisma.ticket.findMany();
          setTickets(fetchedTickets);
          await redis.set('tickets', JSON.stringify(fetchedTickets), 'EX', 3600);
        }
      } catch (err) {
        setError('Failed to load tickets');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Ticket Management</h1>
      <ul>
        {tickets.map(ticket => (
          <li key={ticket.id}>
            <h2>{ticket.title}</h2>
            <p>{ticket.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}