import { back_api } from "$src/lib/const";
import axios from "axios";
import moment from "moment";
const timezone = 'Asia/Seoul';


export const load = async ({ fetch, url }) => {

    console.log('로드는 안해?');
    console.log(url.searchParams.get('date'));


    let getDate = '';
    if (url.searchParams.get('date')) {
        getDate = url.searchParams.get('date')
    }
    
    let workList = []
    try {
        const res = await axios.post(`${back_api}/adm_backlink/get_work_list`, {
            getDate
        })
        console.log(res.data);
        workList = res.data.work_list
        for (let i = 0; i < workList.length; i++) {
            const d = workList[i];
            workList[i]['date_str'] = moment(d.bw_created_at).format("YY-MM-DD HH:mm:ss");
        }
    } catch (error) {
        console.error(error.message);
    }
    return { workList, getDate }

}