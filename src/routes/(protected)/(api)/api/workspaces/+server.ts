import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const workspaces = await locals.pb.collection('workspaces').getList(1,50);
  
  return new Response(JSON.stringify(workspaces.items), {
    headers: { 'Content-Type': 'application/json' }
  });
};
