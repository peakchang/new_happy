import { back_api } from "$src/lib/const";
import axios from "axios";

export const load = async ({ fetch, url, params }) => {

    let allData = [];
    try {
        const res = await axios.get(`${back_api}/traffic_work/last_traffic_chk`)
        if(res.data.status){
            allData = res.data.all_data;
        }
    } catch (error) {
        
    }
    console.log(allData);
    return { allData }

}

