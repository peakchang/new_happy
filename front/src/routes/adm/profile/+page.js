import axios from 'axios';
import { back_api } from '$lib/const';

export const load = async ({ url }) => {

    console.log('sdflijsdlifjslifdj');
    console.log(url);

    const getId = url.searchParams.get('id');
    console.log(getId);

    const start_date = url.searchParams.get('sd');
    const end_date = url.searchParams.get('ed');

    let profile_list = [];
    let pl_name_list = [];
    let profiles = [];
    try {

        const res = await axios.post(`${back_api}/adm/load_profile_list`, { getId, start_date, end_date });
        if (res.data.status) {
            profiles = res.data.profiles;
            profile_list = res.data.profile_list;
            console.log(profile_list);
            // 각 pl_name의 등장 횟수를 카운트하기 위한 객체
            const countMap = {};

            profile_list.forEach(item => {
                // 만약 countMap에 해당 pl_name이 없다면 새로운 중첩 객체를 추가
                if (!countMap[item.pl_name]) {
                    countMap[item.pl_name] = { all: 0, trueCount: 0 };
                }

                // 전체 카운트 증가
                countMap[item.pl_name].all += 1;

                // status가 true인 경우 trueCount 증가
                if (item.pl_work_status) {
                    countMap[item.pl_name].trueCount += 1;
                }
            });

            console.log(profiles);


            profiles = profiles.map(item => ({
                ...item,
                all: countMap[item.pr_name]?.all || 0,
                trueCount: countMap[item.pr_name]?.trueCount || 0
            }));

            console.log(profiles);

        }

    } catch (error) {
        console.error(error.message);
    }



    return { profile_list, pl_name_list, profiles }
}