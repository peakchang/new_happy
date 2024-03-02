import { back_api } from "$src/lib/const";
import axios from "axios";

export const load = async ({ fetch, url, params }) => {

    let cafe_reply_list = [];

    try {
        const res = await axios.post(`${back_api}/cafe_work/load_cafe_reply_list`);
        console.log(res);
        if (res.data.status) {
            console.log(res.data.cafe_reply_list);
            cafe_reply_list = res.data.cafe_reply_list
        }
    } catch (error) {

    }
    return { cafe_reply_list }

}


