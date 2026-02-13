import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const response = await axios.get(`${API_URL}/data`);
            res.status(200).json(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(error.response?.status || 500).json({ message: 'Error fetching data' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}