const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || '/api/ai';

export async function getHealthAdvice(prompt: string): Promise<string> {
  const response = await fetch(`${AI_API_BASE_URL}/health-query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: prompt,
      language: 'english',
      context: { source: 'translations-db-openai' }
    })
  });

  if (!response.ok) {
    throw new Error('Unable to fetch health advice');
  }

  const payload = await response.json();
  return payload?.answer || 'Health advice is currently unavailable.';
}
