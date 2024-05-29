import { back_api } from "$src/lib/const";
import axios from "axios";

export const load = async ({ fetch, url, params }) => {

    let allData = [];
    let allCount = 0;
    try {
        const res = await axios.get(`${back_api}/traffic_work/load_traffic_loop`)
        if(res.data.status){
            allData = res.data.allData;
            allCount = res.data.allCount;
        }
    } catch (error) {
        
    }
    return { allData, allCount }

}

