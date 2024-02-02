import { back_api } from "$src/lib/const";
import axios from "axios";

export const load = async ({ fetch, url, params }) => {
    
    let trafficWorkList = []

    try {
        const res = await axios.get(`${back_api}/traffic_work`); 
        if(res.data.status){
            trafficWorkList = res.data.traffic_list;
        }
    } catch (error) {
        
    }

    console.log(trafficWorkList);
    


    return { trafficWorkList }

}

