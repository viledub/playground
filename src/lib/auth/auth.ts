import { goto } from "$app/navigation";
import { pb } from "$lib/auth/pocketbase"
import { current } from '$lib/stores/user';
import { get } from "svelte/store";

// Load auth state from local storage
if (localStorage.getItem('pb_auth')) {
  pb.authStore.loadFromCookie(localStorage.getItem('pb_auth'));
  current.set(pb.authStore.model);
}

pb.authStore.onChange(() => {
    current.set(pb.authStore.model);
    console.log('CURRENT', get(current))
    localStorage.setItem('pb_auth', pb.authStore.exportToCookie());
});

export const login = async (email: string, password: string) => {
  try {
    await pb.collection('users').authWithPassword(email, password);
    current.set(pb.authStore.model);
  } catch (err) {
    throw new Error('Login failed: ' + err.message);
  }
};

export const logout = () => {
  pb.authStore.clear();
//   current.set(null);
  localStorage.removeItem('pb_auth');
  goto('login')
};

export type Registration = {
    email: string,
    password: string,
    passwordConfirm: string,
    username: string}

export const register = async (request: Registration) => {
    await pb.collection('users').create(request);
    await pb.collection('users').authWithPassword(request.email, request.password.toString());
    await pb.collection('users').requestVerification(request.email);
    goto('dashboard')
}