import { pb } from "$lib/auth/pocketbase"
import { writable } from "svelte/store";

export const current = writable(pb.authStore.model);