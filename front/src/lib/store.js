import cookie from 'cookie';
import { writable } from 'svelte/store'
import { browser } from "$app/environment";

export let admin_sidebar = writable(false);

export let user_info = writable('');
export let authStatus = writable('');
export let testCookie = writable('');