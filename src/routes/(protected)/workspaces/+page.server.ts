export async function load({ locals }){
    const workspaces = await locals.pb.collection('workspaces').getList(1,50);
    return workspaces;
}