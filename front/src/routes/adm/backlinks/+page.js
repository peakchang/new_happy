import { back_api } from "$src/lib/const";
import axios from "axios";


export const load = async ({ fetch, url }) => {

    let backlinkList = []
    let lastWorkList = []

    try {
        const res = await axios.get(`${back_api}/adm_backlink/backlink_get_list`);

        console.log(res.data);
        
        
        if(res.status == 200){
            backlinkList = res.data.backlink_list;
            lastWorkList = res.data.last_work_list
        }
    } catch (error) {
        
    }
    
    
    

    return { backlinkList, lastWorkList }

}