import { back_api } from "$src/lib/const";
import axios from "axios";

export const load = async ({ fetch, url, params }) => {

    let cafe_work_list = [];

    try {
        const res = await axios.post(`${back_api}/cafe_work/load_cafe_work_list`);
        console.log(res);
        if (res.data.status) {
            cafe_work_list = res.data.cafe_work_list
        }
    } catch (error) {

    }
    console.log(cafe_work_list);
    return { cafe_work_list }

}


