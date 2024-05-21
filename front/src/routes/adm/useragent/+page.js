import { back_api } from "$src/lib/const";
import axios from "axios";

export const load = async ({ fetch, url, params }) => {

    let allData = [];
    try {
        console.log(back_api);
        const res = await axios.get(`${back_api}/adm/ua_load`)
        if(res.data.status){
            allData = res.data.allData;
        }
        console.log(allData);
    } catch (error) {
        
    }
    return { allData }

}

