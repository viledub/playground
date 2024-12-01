import { env } from '$env/dynamic/private';
import { error} from '@sveltejs/kit';
import PocketBase from 'pocketbase';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    event.locals.pb = new PocketBase(env.POCKETBASE_URL);
    
    if(!event.route.id) {
        error(404, 'Resource not found')
    }
    if((event.route.id && !event.route.id.startsWith('/(protected)/'))) {
        const response = await resolve(event);
        response.headers.append('set-cookie', event.locals.pb.authStore.exportToCookie());
        return response;
    }
    // load the store data from the request cookie string
    event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');
    try {
        // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
        if (event.locals.pb.authStore.isValid) {
            await event.locals.pb.collection('users').authRefresh();
        }
    } catch (_) {
        // clear the auth store on failed refresh
        event.locals.pb.authStore.clear();
    }
    if(!event.locals.pb.authStore.isValid){
        error(401, "Not allowed")
    }
    
    const response = await resolve(event);

    // send back the default 'pb_auth' cookie to the client with the latest store state
    response.headers.append('set-cookie', event.locals.pb.authStore.exportToCookie());

    return response;
}