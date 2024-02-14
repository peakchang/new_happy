import { back_api } from "$src/lib/const";
import axios from "axios";

export const load = async ({ fetch, url, params }) => {

    const useVal = url.searchParams.get('use') ? url.searchParams.get('use') : "";
    console.log(useVal);
    let trafficWorkList = []

    try {
        const res = await axios.post(`${back_api}/traffic_work`, { useVal });
        if (res.data.status) {
            trafficWorkList = res.data.traffic_list;
        }
    } catch (error) {

    }




    return { trafficWorkList }

}

