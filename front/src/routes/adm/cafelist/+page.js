import { back_api } from "$src/lib/const";
import axios from "axios";

export const load = async ({ fetch, url, params }) => {

    let cafe_list = [];

    try {
        const res = await axios.get(`${back_api}/cafe_work/load_cafe_list`);
        console.log(res);
        if (res.data.status) {
            console.log(res.data.cafe_list);
            cafe_list = res.data.cafe_list
        }
    } catch (error) {

    }
    return { cafe_list }

}


