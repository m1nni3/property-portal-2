export const runtime = 'edge';
import type { NextApiRequest, NextApiResponse } from 'next';

const WORKER_URL = process.env.WORKER_API_URL || 'http://localhost:8787';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = `${WORKER_URL}/api/maintenance${req.query.id ? `/${req.query.id}` : ''}`;
  
  const response = await fetch(url, {
    method: req.method,
    headers: { 'Content-Type': 'application/json' },
    body: req.method !== 'GET' && req.method !== 'DELETE' ? JSON.stringify(req.body) : undefined,
  });

  const data = await response.json();
  res.status(response.status).json(data);
}