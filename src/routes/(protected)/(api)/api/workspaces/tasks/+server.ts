import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  // Example data
  const data = {
    message: 'Hello, SvelteKit!',
    timestamp: new Date().toISOString()
  };

  // Return JSON response
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
};
