import { pb } from '$lib/auth/pocketbase';

export const load = async () => {

    const tasks = await pb.collection('tasks').getList();
    return tasks;
}
