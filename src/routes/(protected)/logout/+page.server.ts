export async function load({ locals }){
    await locals.pb.authStore.clear();
    return {message: "logged out"};
}