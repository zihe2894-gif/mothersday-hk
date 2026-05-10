const API_BASE = '/api';

export async function getConfig() {
  const res = await fetch(`${API_BASE}/config`);
  if (!res.ok) throw new Error('API error');
  return res.json();
}

export async function createShareLink(expiresInHours = 48) {
  const res = await fetch(`${API_BASE}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresInHours })
  });
  if (!res.ok) throw new Error('Share API error');
  return res.json();
}

export async function getVisitStats(days = 7) {
  const res = await fetch(`${API_BASE}/stats/visits?days=${days}`);
  return res.json();
}
