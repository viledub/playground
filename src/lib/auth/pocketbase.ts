import { env } from '$env/dynamic/public'
import PocketBase from 'pocketbase';

export const pb = new PocketBase(env.PUBLIC_PB_URL);