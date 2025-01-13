import { back_api } from "$src/lib/const";
import axios from "axios";

export const load = async ({ fetch, url, params }) => {
    let cafe_id_list = [];
    let cafe_list = [];
    let cafe_work_ready_list = [];
    try {
        const res = await axios.post(
            `${back_api}/cafe_work/load_cafeready_data`,
        );
        if (res.status == 200) {
            console.log(res.data);
            cafe_id_list = res.data.cafe_id_list;
            cafe_list = res.data.cafe_list;
            cafe_work_ready_list = res.data.cafe_work_ready_list;
        }
    } catch (error) {

    }
    return { cafe_id_list, cafe_list, cafe_work_ready_list }

}

