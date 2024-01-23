import { back_api } from "$src/lib/const";
import axios from "axios";


export const load = async ({ fetch, url }) => {

    let backlinkList = []

    try {
        const res = await axios.get(`${back_api}/adm_backlink/backlink_get_list`);
        
        if(res.data.status){
            backlinkList = res.data.backlink_list;
        }
    } catch (error) {
        
    }
    
    
    

    return { backlinkList }

}