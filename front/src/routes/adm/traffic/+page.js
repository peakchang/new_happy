import { back_api } from "$src/lib/const";
import axios from "axios";

export const load = async ({ fetch, url, params }) => {

    console.log(url.searchParams.get('group'));

    let get_group = url.searchParams.get('group')


    let allData = [];
    let allCount = 0;
    try {
        const res = await axios.post(`${back_api}/traffic_work/load_traffic_work`, { get_group })
        console.log(res.data);

        if (res.data.status) {
            console.log(res.data);
            allData = res.data.allData;
            allCount = res.data.allCount;
        }
    } catch (error) {

    }
    return { allData, allCount }

}

