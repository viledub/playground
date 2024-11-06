import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private'
import PocketBase  from 'pocketbase';
export const load: PageServerLoad = async () => {
  const apiUrl = env.POCKETBASE_URL;

  if (!apiUrl) {
    throw new Error('API_URL environment variable is not set');
  }

  const pb = new PocketBase(apiUrl);

// fetch a paginated records list
const resultList = await pb.collection('tests').getList(1, 50, {
    filter: 'created >= "2022-01-01 00:00:00"  ',
});

  

  return {
    data: resultList,
  };
};
