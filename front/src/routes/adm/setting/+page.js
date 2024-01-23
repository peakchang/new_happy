import axios from 'axios';
import { back_api } from '$lib/const';

export const load = async ({ url }) => {
    let get_config;

    try {

        const res = await axios.get(`${back_api}/adm/setting`)

        get_config = res.data.get_config
    } catch (error) {
        console.error(error.message);
    }

    return { get_config }
}