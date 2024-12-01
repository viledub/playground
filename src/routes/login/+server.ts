import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
    const { username, password } = await request.json();
    const { token, record } = await locals.pb.collection('users').authWithPassword(username, password);
    console.log(record.id,  locals.pb.authStore.isValid)
    return json({message: 'success', token, record});
}