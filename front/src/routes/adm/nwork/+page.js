import { back_api } from "$src/lib/const";
import axios from "axios";

export const load = async ({ fetch, url, params }) => {

    const page = url.searchParams.get('page')
    const base = url.searchParams.get('base')

    let nworkList = []
    let maxPage = 0;
    let allCount = 0;
    let errCount = 0;
    try {
        const res = await axios.post(`${back_api}/nwork/get_list`, {
            page, base
        })
        nworkList = res.data.nwork_list
        maxPage = res.data.maxPage
        allCount = res.data.all_count
        errCount = res.data.err_count
        for (let i = 0; i < nworkList.length; i++) {
            if (nworkList[i].n_lastwork_at) {
                const date = new Date(nworkList[i].n_lastwork_at);
                const utcDate = new Date(date.getTime() - (9 * 60 * 60 * 1000));
                const getTime = formatDate(utcDate, true);
                nworkList[i]['date_str'] = getTime;
            }
        }
    } catch (error) {
        console.error(error.message);

    }




    return { nworkList, maxPage, allCount, page, errCount }

}


const formatDate = (date, yearBool) => {
    let returnDate;
    const year = date.getFullYear().toString().slice(2); // '23'
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월을 2자리로
    const day = String(date.getDate()).padStart(2, '0'); // 일을 2자리로
    // const hours = String(date.getHours()).padStart(2, '0'); // 시를 2자리로
    // const minutes = String(date.getMinutes()).padStart(2, '0'); // 분을 2자리로
    if (yearBool) {
        returnDate = `${year}.${month}.${day}`
    } else {
        returnDate = `${month}.${day}`
    }
    return returnDate
}