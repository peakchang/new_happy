import { back_api } from "$src/lib/const";
import axios from "axios";

export const load = async ({ fetch, url, params }) => {

    let allData = [];
    try {
        const res = await axios.get(`${back_api}/adm/keyword_load`)
        if(res.data.status){
            allData = res.data.allData;
        }
    } catch (error) {
        
    }
    return { allData }

}

