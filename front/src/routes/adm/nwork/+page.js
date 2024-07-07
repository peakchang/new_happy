import { back_api } from "$src/lib/const";
import axios from "axios";
import moment from "moment";
const timezone = 'Asia/Seoul';

export const load = async ({ fetch, url, params }) => {

    const page = url.searchParams.get('page')
    const base = url.searchParams.get('base')
    const getid = url.searchParams.get('id')

    let nworkList = []
    let maxPage = 0;
    let allCount = 0;
    let errCount = 0;
    let useComList = [];
    try {
        const res = await axios.post(`${back_api}/nwork/get_list`, {
            page, base, getid
        })
        useComList = res.data.use_com_list 
        nworkList = res.data.nwork_list
        maxPage = res.data.maxPage
        allCount = res.data.all_count
        errCount = res.data.err_count
        for (let i = 0; i < nworkList.length; i++) {
            if (nworkList[i].n_lastwork_at) {
                nworkList[i]['date_str'] = moment(nworkList[i].n_lastwork_at).format("YY-MM-DD HH:mm:ss");
            }
        }
        console.log(nworkList);
    } catch (error) {
        console.error(error.message);

    }




    return { nworkList, maxPage, allCount, page, errCount, useComList }

}