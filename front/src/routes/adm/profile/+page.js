import axios from 'axios';
import { back_api } from '$lib/const';

export const load = async ({ url }) => {

    console.log('sdflijsdlifjslifdj');
    console.log(url);

    const getId = url.searchParams.get('id');
    console.log(getId);

    let profile_list = [];
    let pl_name_list = [];
    let profiles = [];
    try {

        const res = await axios.post(`${back_api}/adm/load_profile_list`, { getId });
        if (res.data.status) {

            profiles = res.data.profiles;
            profile_list = res.data.profile_list;

            // 각 pl_name의 등장 횟수를 카운트하기 위한 객체
            const countMap = {};

            // profile_list를 순회하면서 카운트 증가
            profile_list.forEach(item => {
                if (countMap[item.pl_name]) {
                    countMap[item.pl_name]++;
                } else {
                    countMap[item.pl_name] = 1;
                }
            });

            // countMap 객체를 pl_name_list 배열로 변환
            pl_name_list = Object.keys(countMap).map(pl_name => {
                return { pl_name: pl_name, count: countMap[pl_name] };
            });
        }

    } catch (error) {
        console.error(error.message);
    }



    return { profile_list, pl_name_list, profiles }
}