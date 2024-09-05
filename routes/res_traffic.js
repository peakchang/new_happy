import express from "express";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr, getRandomNumber, shuffle } from "../back-lib/lib.js";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const resTrafficRouter = express.Router();


// plz 트래픽 작업!!!!!!

// 여기가 work 작업!!!



resTrafficRouter.post('/update_traffic_plz_info', async (req, res, next) => {
    let status = true;
    const body = req.body;
    console.log(body);


    try {
        if (body.work_status == 'False') {
            const updateFalseWorkQuery = "UPDATE site_traffic_plz SET st_use = ? WHERE st_id = ?";
            await sql_con.promise().query(updateFalseWorkQuery, [false, body['st_id']]);
        } else {
            const getSiteTrafficPlzInfoQuery = "SELECT * FROM site_traffic_plz WHERE st_id = ?";
            const getSiteTrafficPlzInfo = await sql_con.promise().query(getSiteTrafficPlzInfoQuery, [body['st_id']]);
            const siteTrafficPlzInfo = getSiteTrafficPlzInfo[0][0];

            let siteTrafficPlzUpdateQuery = ""
            if (body.work_type == 'check') {
                siteTrafficPlzUpdateQuery = "UPDATE site_traffic_plz SET st_expose_count = ? WHERE st_id = ?";
                await sql_con.promise().query(siteTrafficPlzUpdateQuery, [siteTrafficPlzInfo['st_expose_count'] + 1, body['st_id']]);
            } else {
                siteTrafficPlzUpdateQuery = "UPDATE site_traffic_plz SET st_now_click_count =?, st_expose_count = ? WHERE st_id =?";
                await sql_con.promise().query(siteTrafficPlzUpdateQuery, [siteTrafficPlzInfo['st_now_click_count'] + 1, siteTrafficPlzInfo['st_expose_count'] + 1, body['st_id']]);
            }
        }
    } catch (error) {
        status = false;
    }

    res.json({ status });
})


resTrafficRouter.get('/update_profile_count', async (req, res, next) => {
    let status = true;
    const query = req.query
    // 사용한 프로필에도 작업 횟수 더해주기!!
    try {
        const getProfileWorkCountQuery = "SELECT pl_work_count FROM profile_list WHERE pl_id = ?";
        const getProfileWorkCount = await sql_con.promise().query(getProfileWorkCountQuery, [query['pl_id']]);
        const profile_work_count = getProfileWorkCount[0][0]['pl_work_count'];

        console.log(`얻은 프로필 카운트는?? ${profile_work_count}`);
        console.log(`업데이트 할 프로필 카운트는?? ${profile_work_count}`);

        const updateProfileWorkCountQuery = "UPDATE profile_list SET pl_work_count =? WHERE pl_id =?"
        await sql_con.promise().query(updateProfileWorkCountQuery, [profile_work_count + 1, query['pl_id']]);
    } catch (error) {
        console.error(error.message);
        status = false;
    }

    res.json({ status });
})

resTrafficRouter.get('/success_plz_work', async (req, res, next) => {

    console.log('성공한');
    let status = true;
    const query = req.query;


    // 현재 클릭수에 하나 더하기~~~
    try {
        const getSuccessInfoQuery = "SELECT * FROM site_traffic_plz WHERE st_id = ?"
        const getSuccessInfo = await sql_con.promise().query(getSuccessInfoQuery, [query['st_id']]);
        const success_info = getSuccessInfo[0][0];
        const updateSuccessInfoQuery = `UPDATE site_traffic_plz SET st_now_click_count = ? WHERE st_id = ${query['st_id']}`
        await sql_con.promise().query(updateSuccessInfoQuery, [success_info['st_now_click_count'] + 1]);
    } catch (error) {
        console.error(error.message);
        status = false;
    }

    // 마지막 작업 표시하기~~~
    try {
        const nowDateTime = moment().format('YY/MM/DD HH:mm:ss');
        const lastTrafficChkQuery = "SELECT * FROM last_traffic_chk WHERE lt_name = ?";
        const lastTrafficChk = await sql_con.promise().query(lastTrafficChkQuery, [query.pc_id]);
        const last_traffic_chk = lastTrafficChk[0][0];
        if (!last_traffic_chk) {
            const insertLastTrafficQuery = "INSERT INTO last_traffic_chk (lt_name, lt_last_time) VALUES (?,?)";
            await sql_con.promise().query(insertLastTrafficQuery, [query.pc_id, nowDateTime]);
        } else {
            const updateLastTrafficQuery = "UPDATE last_traffic_chk SET lt_last_time = ? WHERE lt_name = ?";
            await sql_con.promise().query(updateLastTrafficQuery, [nowDateTime, query.pc_id]);
        }
    } catch (error) {
        console.error(error.message);
        status = false;
    }
    res.json({ status });
})



// 본 클릭 작업시 작업 내용 불러오기


resTrafficRouter.get('/load_real_work_plz', async (req, res, next) => {
    console.log('load_real_work_plz 일단 들어오고~~~');

    let status = true;
    let work_type = "click"
    const body = req.query;
    let get_work = {};
    try {

        const loadWorkListQuery = "SELECT * FROM site_traffic_plz WHERE st_use = TRUE AND st_click_status = FALSE AND (st_target_click_count = 'loop' OR st_target_click_count > st_now_click_count) AND st_expose_count > 3 AND st_expose_count >= st_now_click_count * 3 AND st_group = ?";
        const loadWorkList = await sql_con.promise().query(loadWorkListQuery, [body.group]);


        if (loadWorkList[0].length == 0) {

            const loadWorkExposeListQuery = "SELECT * FROM site_traffic_plz WHERE st_use = TRUE AND st_click_status = FALSE AND (st_target_click_count = 'loop' OR st_target_click_count > st_now_click_count) AND st_group = ?";
            const loadWorkExposeList = await sql_con.promise().query(loadWorkExposeListQuery, [body.group]);

            console.log(`load_work_expose_list 길이는? : ${loadWorkExposeList[0].length}`);

            if (loadWorkExposeList[0].length == 0) {
                const updateClickStatusQuery = `UPDATE site_traffic_plz SET st_click_status = FALSE WHERE st_group = ?`;
                await sql_con.promise().query(updateClickStatusQuery, [body.group]);
                status = false;
            } else {
                work_type = 'check';
                const shuffleLoadWorkExposeList = shuffle(loadWorkExposeList[0]);
                const sortedLoadWorkExposeList = shuffleLoadWorkExposeList.sort((a, b) => a.st_expose_count - b.st_expose_count);
                get_work = sortedLoadWorkExposeList[0]
            }
        } else {
            console.log(loadWorkList.length);
            const getRanNum = getRandomNumber(0, loadWorkList[0].length - 1)
            console.log(getRanNum);
            get_work = loadWorkList[0][getRanNum]
        }
    } catch (error) {
        console.error(error.message);
        status = false;
    }

    console.log(`status : ${status}`);
    console.log(`get_work : ${get_work['st_subject']}`);
    console.log(`work_type : ${work_type}`);

    res.json({ status, get_work, work_type });
})


resTrafficRouter.get('/load_work_plz', async (req, res, next) => {
    console.log('load_work_plz 일단 들어오고~~~');

    let status = true;
    let work_type = "check"
    const body = req.query;
    let get_work = {};

    console.log(body.group);

    try {
        let load_work_expose_list = [];
        const loadWorkExposeListQuery = "SELECT * FROM site_traffic_plz WHERE st_use = TRUE AND st_click_status = FALSE AND (st_target_click_count = 'loop' OR st_target_click_count > st_now_click_count) AND st_group = ?";
        const loadWorkExposeList = await sql_con.promise().query(loadWorkExposeListQuery, [body.group]);
        load_work_expose_list = loadWorkExposeList[0]

        console.log(`load_work_expose_list 길이는? : ${load_work_expose_list.length}`);

        if (load_work_expose_list.length == 0) {
            const loadWorkExposeListQuery = "SELECT * FROM site_traffic_plz WHERE st_use = TRUE AND st_click_status = FALSE AND st_group = ?";
            const loadWorkExposeList = await sql_con.promise().query(loadWorkExposeListQuery, [body.group]);
            load_work_expose_list = loadWorkExposeList[0]

            if (load_work_expose_list.length == 0) {
                const updateClickStatusQuery = `UPDATE site_traffic_plz SET st_click_status = FALSE WHERE st_group = ?`;
                await sql_con.promise().query(updateClickStatusQuery, [body.group]);
                status = false;
            }
        }


        if (load_work_expose_list.length > 0) {
            const shuffleLoadWorkExposeList = shuffle(load_work_expose_list);
        


            const sortedLoadWorkExposeList = shuffleLoadWorkExposeList.sort((a, b) => a.st_expose_count - b.st_expose_count);
            get_work = sortedLoadWorkExposeList[0]
        }

    } catch (error) {
        console.error(error.message);
        status = false;
    }

    console.log(`status : ${status}`);
    console.log(`get_work : ${get_work['st_subject']}`);
    console.log(`work_type : ${work_type}`);



    res.json({ status, get_work, work_type });
})
// 사용 안할듯
// resTrafficRouter.use('/load_work', async (req, res, next) => {
//     console.log('일단 들어오고~~~');

//     let status = true;
//     const body = req.body;
//     let get_work = {};
//     try {

//         const loadWorkListQuery = "SELECT * FROM site_traffic_plz WHERE st_use = TRUE AND st_click_status = FALSE AND (st_target_click_count = 'loop' OR st_target_click_count > st_now_click_count)";
//         const loadWorkList = await sql_con.promise().query(loadWorkListQuery);

//         if (loadWorkList[0].length == 0) {
//             const updateClickStatusQuery = `UPDATE site_traffic_plz SET st_click_status = FALSE`;
//             await sql_con.promise().query(updateClickStatusQuery);
//             status = false;
//         } else {
//             console.log(loadWorkList.length);
//             const getRanNum = getRandomNumber(0, loadWorkList[0].length - 1)
//             console.log(getRanNum);
//             get_work = loadWorkList[0][getRanNum]
//         }

//     } catch (error) {
//         status = false;
//     }

//     res.json({ status, get_work });
// })


// 본 클릭 작업시 해당 키워드 상태 업데이트
resTrafficRouter.use('/update_chk_work', async (req, res, next) => {
    let status = true;
    const body = req.body;
    const stId = body.st_id;
    try {
        const updateWorkStatus = "UPDATE site_traffic_plz SET st_click_status = TRUE WHERE st_id = ?";
        await sql_con.promise().query(updateWorkStatus, [stId]);
    } catch (error) {

    }
    res.json({ status });
})


// notWork 즉 키워드만 얻는 곳!!!
resTrafficRouter.use('/load_notwork', async (req, res, next) => {
    let status = true;
    const body = req.body;
    let get_keyword = {};
    try {

        const loadKeyworkListQuery = "SELECT * FROM pre_keyword";
        const loadKeyworkList = await sql_con.promise().query(loadKeyworkListQuery);
        const keyworkList = loadKeyworkList[0]
        const ranNum = getRandomNumber(0, keyworkList.length);
        get_keyword = keyworkList[ranNum]
    } catch (error) {
        status = false;
    }

    res.json({ status, get_keyword });
})


// 전체 작업 시작시 (한바퀴 돌때) 프로필 얻고 UserAgent 없으면 설정 하고 UserAgent 값 얻은 뒤 마지막 작업시간 표시하고 작업 진행~
resTrafficRouter.use('/get_profile_plz', async (req, res, next) => {

    console.log('일단 들어 와야지?!??!?!!?');
    let status = true;

    const body = req.body;

    let work_type = {}
    let work_profile = {}
    let getUaNum = 0;
    let user_agent = ""
    try {


        const getWorkTypeQuery = "SELECT * FROM profile WHERE pr_name = ?";
        const getWorkType = await sql_con.promise().query(getWorkTypeQuery, [body.pc_id]);
        work_type = getWorkType[0][0];

        const getWorkProfileListQuery = "SELECT * FROM profile_list WHERE pl_name = ? AND pl_work_status = FALSE ORDER BY pl_lastworked_at ASC LIMIT 5;"
        const getWorkProfileList = await sql_con.promise().query(getWorkProfileListQuery, [body.pc_id]);
        const workProfileList = getWorkProfileList[0];
        const getWorkProfileNum = getRandomNumber(0, workProfileList.length);
        work_profile = workProfileList[getWorkProfileNum]
        if (!work_profile.pl_ua_num) {
            const getUaCountQuery = "SELECT COUNT(*) AS ua_count FROM user_agent;"
            const getUaCount = await sql_con.promise().query(getUaCountQuery);
            const ua_count = getUaCount[0][0]['ua_count'];
            getUaNum = getRandomNumber(1, ua_count)
            const updateWorkProfileUaQuery = "UPDATE profile_list SET pl_ua_num = ? WHERE pl_id = ?";
            await sql_con.promise().query(updateWorkProfileUaQuery, [getUaNum, work_profile.pl_id]);
        } else {
            getUaNum = work_profile.pl_ua_num;
        }

        const nowDateTime = moment().format('YY/MM/DD HH:mm:ss');
        console.log(nowDateTime);
        console.log(work_profile.pl_id);
        const updateProfileLastworkedAtQuery = "UPDATE profile_list SET pl_lastworked_at = ?, pl_work_status = TRUE WHERE pl_id = ?";
        await sql_con.promise().query(updateProfileLastworkedAtQuery, [nowDateTime, work_profile.pl_id]);

        const getUserAgentQuery = "SELECT * FROM user_agent WHERE ua_id = ?";
        const getUserAgent = await sql_con.promise().query(getUserAgentQuery, [getUaNum]);
        user_agent = getUserAgent[0][0];

        console.log(user_agent);


    } catch (error) {

        console.error(error.message);
        status = false;
    }

    res.json({ status, work_profile, user_agent, work_type });
})


// 그룹 트래픽 작업!!!!!!!!!!!!!!!!!!!!!!


resTrafficRouter.use('/get_profile_work_update', async (req, res, next) => {
    let status = true;

    const body = req.body;
    let userAgentInfo = ""

    try {

        if (body.uaStatus == 'False') {
            const updateProfileQuery = "UPDATE nwork SET n_used = TRUE, n_ua = ? WHERE n_idx = ?";
            await sql_con.promise().query(updateProfileQuery, [body.uaVal, body.n_idx]);
        } else {
            const updateProfileQuery = "UPDATE nwork SET n_used = TRUE WHERE n_idx = ?";
            await sql_con.promise().query(updateProfileQuery, [body.n_idx]);
        }


        const getUserAgentInfoQuery = "SELECT * FROM user_agent WHERE ua_id =?"
        const getUserAgentInfo = await sql_con.promise().query(getUserAgentInfoQuery, [body.uaVal]);
        userAgentInfo = getUserAgentInfo[0][0];

    } catch (error) {
        console.error(error.message);
        status = false;
    }

    res.json({ status, userAgentInfo });
})

resTrafficRouter.use('/get_profile_work_info', async (req, res, next) => {
    let status = true;

    const body = req.body;
    const pcId = body.pc_id;

    let get_profile_work_list = [];
    let user_agent_count = 0

    try {
        const getProfileWorkListQuery = "SELECT * FROM nwork WHERE n_use_com = ? AND n_used = FALSE";
        const getProfileWorkList = await sql_con.promise().query(getProfileWorkListQuery, [pcId]);
        get_profile_work_list = getProfileWorkList[0];

        if (get_profile_work_list.length == 0) {
            const updateProfileListFalseQuery = "UPDATE nwork SET n_used = FALSE WHERE n_use_com = ?";
            await sql_con.promise().query(updateProfileListFalseQuery, [pcId]);
            status = false;
        } else {
            const userAgentCountQuery = "SELECT COUNT(*) AS ua_count FROM user_agent"
            const userAgentCount = await sql_con.promise().query(userAgentCountQuery);
            user_agent_count = userAgentCount[0][0]['ua_count'];
        }
    } catch (error) {
        console.error(error.message);
        status = false;
    }
    res.json({ status, get_profile_work_list, user_agent_count });
})



resTrafficRouter.use('/update_onclick_link', async (req, res, next) => {
    let status = true;
    try {
        const getDbLinkQuery = "SELECT st_link FROM site_traffic_loop WHERE st_link = ?";
        const getDbLink = await sql_con.promise().query(getDbLinkQuery, req.body.link);
        const get_db_link_chk = getDbLink[0][0];
        if (get_db_link_chk) {
            const get_db_link = get_db_link_chk['st_link']
            const updateDbLinkQuery = "UPDATE site_traffic_loop SET st_unique_link =? WHERE st_link =?";
            await sql_con.promise().query(updateDbLinkQuery, [req.body.onclickLink, get_db_link]);
        }
    } catch (error) {
        status = false;
    }



    res.json({ status });
})



resTrafficRouter.get('/load_naver_id', async (req, res, next) => {
    let status = true;
    let nwork = [];
    try {
        const loadNworkInfoQuery = "SELECT * FROM nwork WHERE (n_blog_any = FALSE OR n_blog_any IS NULL)  AND (n_cafe = FALSE OR n_cafe IS NULL) AND n_use = TRUE ORDER BY n_lastwork_at ASC LIMIT 5;";
        const loadNworkInfo = await sql_con.promise().query(loadNworkInfoQuery);
        const nwork_list = loadNworkInfo[0];

        const randomIndex = Math.floor(Math.random() * nwork_list.length);
        nwork = nwork_list[randomIndex];

        const now = moment().format('YYYY-MM-DD HH:mm:ss');
        const updateNworkLastWorkDate = "UPDATE nwork SET n_lastwork_at = ? WHERE n_id = ?";
        await sql_con.promise().query(updateNworkLastWorkDate, [now, nwork['n_id']]);

    } catch (error) {
        console.error(error.message);
        status = false;
    }

    res.json({ status, nwork });
})



resTrafficRouter.get('/error_group_work', async (req, res, next) => {
    let status = true;
    const query = req.query
    try {
        const updateErrStatus = "UPDATE site_traffic_loop SET st_use = ? WHERE st_id = ?";
        await sql_con.promise().query(updateErrStatus, [false, query['st_id']]);
    } catch (error) {
        console.error(error.message);
        status = false;
    }

    res.json({ status });
})


resTrafficRouter.get('/get_user_agent', async (req, res, next) => {
    let status = true;

    let user_agent_list = []

    try {
        const getUserAgentListQuery = "SELECT * FROM user_agent";
        const getUserAgentList = await sql_con.promise().query(getUserAgentListQuery);
        user_agent_list = getUserAgentList[0];
    } catch (error) {
        console.error(error.message);
        status = false;
    }

    res.json({ status, user_agent_list });
})

resTrafficRouter.get('/get_keyword', async (req, res, next) => {
    let status = true;
    let keyword_list = []

    const query = req.query
    let addQuery = ''
    if (query.group && query.group != 'None') {
        addQuery = `WHERE pk_group = '${query.group}'`;
    }
    try {
        const getKeywordListQuery = `SELECT * FROM pre_keyword ${addQuery}`;
        const getKeywordList = await sql_con.promise().query(getKeywordListQuery);
        keyword_list = getKeywordList[0];
    } catch (error) {
        console.error(error.message);
        status = false;
    }
    res.json({ status, keyword_list });
})



resTrafficRouter.get('/load_group_work_info', async (req, res, next) => {
    let status = true;
    let work_info_list = []
    let user_agent_list = [];
    let all_work_info_list = [];

    const query = req.query
    let addQuery = ''
    if (query.group && query.group != 'None') {
        addQuery = `AND st_group = '${query.group}'`;
    }

    try {
        const getWorkInfoListQuery = `SELECT * FROM site_traffic_loop WHERE st_use = TRUE AND st_click_bool = FALSE AND (st_target_click_count = 'loop' OR st_target_click_count > st_now_click_count) ${addQuery}`;
        const getWorkInfoList = await sql_con.promise().query(getWorkInfoListQuery);
        work_info_list = getWorkInfoList[0];

        const getUserAgentListQuery = "SELECT * FROM user_agent";
        const getUserAgentList = await sql_con.promise().query(getUserAgentListQuery);
        user_agent_list = getUserAgentList[0];

        if (work_info_list.length == 0) {
            const updateClickBoolStatus = `UPDATE site_traffic_loop SET st_click_bool = FALSE`;
            await sql_con.promise().query(updateClickBoolStatus);
            status = false;
        }

        if (query.group && query.group != 'None') {
            const getAllWorkInfoListQuery = `SELECT * FROM site_traffic_loop`;
            const getAllWorkInfoList = await sql_con.promise().query(getAllWorkInfoListQuery);
            all_work_info_list = getAllWorkInfoList[0];
        }


    } catch (error) {
        console.error(error.message);
        status = false;
    }
    res.json({ status, work_info_list, user_agent_list, all_work_info_list });
})

resTrafficRouter.get('/update_group_work_info_start', async (req, res, next) => {
    let status = true;
    const query = req.query;
    try {
        const updateClickBoolQuery = "UPDATE site_traffic_loop SET st_click_bool = TRUE WHERE st_id = ?"
        await sql_con.promise().query(updateClickBoolQuery, [query['st_id']]);
    } catch (error) {
        console.error(error.message);
        status = false;
    }
    res.json({ status });
})


resTrafficRouter.get('/success_group_work', async (req, res, next) => {
    let status = true;
    const query = req.query;
    try {
        const getSuccessInfoQuery = "SELECT * FROM site_traffic_loop WHERE st_id = ?"
        const getSuccessInfo = await sql_con.promise().query(getSuccessInfoQuery, [query['st_id']]);
        const success_info = getSuccessInfo[0][0];

        const nowDate = moment().format('YY/MM/DD');

        const now = new Date();
        const currentHour = now.getHours();
        const getRateStr = `${nowDate} ${query.now_page}페이지 / ${query.now_rate} 번째 \n`

        let latestRateMemo = success_info['st_rate_memo'];
        let resMemo = ""
        let addQuery = ""

        if (!latestRateMemo || latestRateMemo == null || (!latestRateMemo.split('\n')[0].includes(nowDate) && currentHour >= 10)) {
            if (latestRateMemo) {
                resMemo = getRateStr + latestRateMemo
            } else {
                resMemo = getRateStr
            }
        }

        if (resMemo) {
            addQuery = `, st_rate_memo = "${resMemo}"`
        }


        const updateSuccessInfoQuery = `UPDATE site_traffic_loop SET st_now_click_count = ? ${addQuery} WHERE st_id = ${query['st_id']}`


        await sql_con.promise().query(updateSuccessInfoQuery, [success_info['st_now_click_count'] + 1]);




        const nowDateTime = moment().format('YY/MM/DD HH:mm:ss');
        const lastTrafficChkQuery = "SELECT * FROM last_traffic_chk WHERE lt_name = ?";
        const lastTrafficChk = await sql_con.promise().query(lastTrafficChkQuery, [query.pc_id]);
        const last_traffic_chk = lastTrafficChk[0][0];
        if (!last_traffic_chk) {
            const insertLastTrafficQuery = "INSERT INTO last_traffic_chk (lt_name, lt_last_time) VALUES (?,?)";
            await sql_con.promise().query(insertLastTrafficQuery, [query.pc_id, nowDateTime]);
        } else {
            const updateLastTrafficQuery = "UPDATE last_traffic_chk SET lt_last_time = ? WHERE lt_name = ?";
            await sql_con.promise().query(updateLastTrafficQuery, [nowDateTime, query.pc_id]);
        }

    } catch (error) {
        console.error(error.message);
        status = false;
    }
    res.json({ status });
})






// 무제한 트래픽 작업!!!!!!!!!!!!!!!!!!!!!



resTrafficRouter.get('/crontab_nineam', async (req, res, next) => {
    let status = true;
    try {
        const getAllDataQuery = "SELECT * FROM site_traffic_loop WHERE st_use = TRUE";
        const getAllData = await sql_con.promise().query(getAllDataQuery);
        const all_data = getAllData[0];
        for (let i = 0; i < all_data.length; i++) {
            const data = all_data[i];
            let jsonStr = ""
            if (data['st_click_obj']) {
                const jsonObject = JSON.parse(data['st_click_obj']);
                const yesterday = moment().subtract(1, 'days').format('YY-MM-DD');
                jsonObject['previous_time'].push({ [yesterday]: data['st_now_click_count'] });
                jsonObject['allCount'] = Number(jsonObject['allCount']) + Number(data['st_now_click_count']);
                if (jsonObject['previous_time'].length > 30) {
                    jsonObject['previous_time'].shift();
                }
                jsonStr = JSON.stringify(jsonObject);
            } else {
                const yesterday = moment().subtract(1, 'days').format('YY-MM-DD');
                const onData = { 'previous_time': [{ [yesterday]: data['st_now_click_count'] }], 'allCount': data['st_now_click_count'] }
                jsonStr = JSON.stringify(onData);
            }

            const resetNowClickCountQuery = "UPDATE site_traffic_loop SET st_now_click_count = 0, st_click_obj = ? WHERE st_id = ?";
            await sql_con.promise().query(resetNowClickCountQuery, [jsonStr, data['st_id']]);
        }
    } catch (error) {
        console.error(error.message);
        status = false;
    }


    res.send('정리되는 요청이 성공적으로 수행되다!!!!!!!!!!!!!!!!!!!!!.');
})


resTrafficRouter.get('/success_loop_work', async (req, res, next) => {
    let status = true;
    // 쿼리 등 기타 정보 불러오기
    const query = req.query;
    if (query['type']) {
        const updateRowQuery = "UPDATE site_traffic_loop SET st_now_click_count= ?, st_click_bool = TRUE WHERE st_id = ?";
        await sql_con.promise().query(updateRowQuery, [query['st_now_click_count'], query['st_id']]);
        return res.json({ status })
    }

    const nowDate = moment().format('YY/MM/DD');
    const nowDateTime = moment().format('YY/MM/DD HH:mm:ss');
    const getRateStr = `${nowDate} ${query.now_page}페이지 / ${query.now_rate} 번째 \n`

    try {
        // 먼저 메모를 불러와서 \n(개행) 으로 분리, 첫번째 줄에 날짜가 포함 되어 있는지 확인
        const getLatestRateMemoQuery = "SELECT st_rate_memo FROM site_traffic_loop WHERE st_id = ?";
        const getLatestRateMemo = await sql_con.promise().query(getLatestRateMemoQuery, [query.st_id]);
        const latestRateMemo = getLatestRateMemo[0][0]['st_rate_memo'];

        const now = new Date();
        const currentHour = now.getHours();

        // 포함 안되어 있으면 업데이트 하기
        if (latestRateMemo == null || !latestRateMemo.split('\n')[0].includes(nowDate) && currentHour >= 10) {
            let resMemo = ""
            if (latestRateMemo) {
                resMemo = getRateStr + latestRateMemo
            } else {
                resMemo = getRateStr
            }

            const updateRowQuery = "UPDATE site_traffic_loop SET st_now_click_count= ?, st_rate_memo = ?, st_click_bool = TRUE WHERE st_id = ?";
            await sql_con.promise().query(updateRowQuery, [query['st_now_click_count'], resMemo, query['st_id']]);
        } else {
            const updateRowQuery = "UPDATE site_traffic_loop SET st_now_click_count= ?, st_click_bool = TRUE WHERE st_id = ?";
            await sql_con.promise().query(updateRowQuery, [query['st_now_click_count'], query['st_id']]);
        }


        const lastTrafficChkQuery = "SELECT * FROM last_traffic_chk WHERE lt_name = ?";
        const lastTrafficChk = await sql_con.promise().query(lastTrafficChkQuery, [query.pc_id]);
        const last_traffic_chk = lastTrafficChk[0][0];
        if (!last_traffic_chk) {
            const insertLastTrafficQuery = "INSERT INTO last_traffic_chk (lt_name, lt_last_time) VALUES (?,?)";
            await sql_con.promise().query(insertLastTrafficQuery, [query.pc_id, nowDateTime]);
        } else {
            const updateLastTrafficQuery = "UPDATE last_traffic_chk SET lt_last_time = ? WHERE lt_name = ?";
            await sql_con.promise().query(updateLastTrafficQuery, [nowDateTime, query.pc_id]);
        }

    } catch (error) {
        console.error(error.message);
        status = false;
    }
    return res.json({ status })
})

resTrafficRouter.get('/fail_loop_work', async (req, res, next) => {
    let status = true;
    const query = req.query;

    try {
        // 기존 메모를 딴 후 새 메모 앞에 붙여넣기
        const getFailContentQuery = "SELECT st_rate_memo FROM site_traffic_loop WHERE st_id = ?";
        const getFailContent = await sql_con.promise().query(getFailContentQuery, [query.st_id]);
        const get_fail_content = getFailContent[0][0]['st_rate_memo'];
        const nowSrt = moment().format('YYYY-MM-DD HH:mm')
        const memoContent = `${nowSrt} / 에러! 순위 빠짐!\n${get_fail_content}`
        const updateFailQuery = "UPDATE site_traffic_loop SET st_use = FALSE, st_rate_memo = ? WHERE st_id = ?";
        await sql_con.promise().query(updateFailQuery, [memoContent, query.st_id]);
    } catch (error) {
        console.error(error.message);
        status = false;
    }
    res.json({ status })
})


resTrafficRouter.get('/load_loop_work_info', async (req, res, next) => {
    let status = true;
    let load_work_info = [];
    let user_agent_list = [];
    try {
        const loadWorkInfoQuery = "SELECT * FROM site_traffic_loop WHERE st_use = TRUE AND st_click_bool = FALSE AND (st_target_click_count = 'loop' OR st_target_click_count > st_now_click_count);"
        const loadWorkInfo = await sql_con.promise().query(loadWorkInfoQuery);
        load_work_info = loadWorkInfo[0]

        const getUserAgentListQuery = "SELECT * FROM user_agent";
        const getUserAgentList = await sql_con.promise().query(getUserAgentListQuery);
        user_agent_list = getUserAgentList[0];

        if (load_work_info.length == 0) {
            const updateClickBoolQuery = "UPDATE site_traffic_loop SET st_click_bool = FALSE";
            await sql_con.promise().query(updateClickBoolQuery);
        }


    } catch (error) {
        console.error(error.message);
        status = false;
    }
    res.json({ status, load_work_info, user_agent_list })
})




// 일반 트래픽 작업!!!!!!!!!!!!!!!!!!!!!!!!

resTrafficRouter.get('/error_update', async (req, res, next) => {
    let status = true;
    const stId = req.query.st_id;
    let work_info = ""
    try {
        const getWorkInfoQuery = "SELECT * FROM site_traffic WHERE st_id = ?"
        const getWorkInfo = await sql_con.promise().query(getWorkInfoQuery, [stId]);
        work_info = getWorkInfo[0][0]
    } catch (error) {
        status = false;
    }

    try {
        const nowSrt = moment().format('YYYY-MM-DD HH:mm')
        const memoContent = `${work_info['st_memo']}${nowSrt} / 에러! 순위 빠짐!\n`
        const errUpdateQuery = "UPDATE site_traffic SET st_memo = ?, st_use = false WHERE st_id = ?";
        await sql_con.promise().query(errUpdateQuery, [memoContent, stId]);
    } catch (error) {
        status = false;
    }
    res.json({ status })
})


resTrafficRouter.get('/update_rank_memo', async (req, res, next) => {
    let status = true;
    const query = req.query;
    let work_info = {}

    try {
        const getWorkInfoQuery = "SELECT * FROM site_traffic WHERE st_id = ?"
        const getWorkInfo = await sql_con.promise().query(getWorkInfoQuery, [query.st_id]);
        work_info = getWorkInfo[0][0]
    } catch (error) {
        status = false;
    }

    let memoContent = ""
    const nowSrt = moment().format('YYYY-MM-DD HH:mm')
    if (query.status == 'success') {
        memoContent = `${work_info['st_memo'] ? work_info['st_memo'] : ""}${nowSrt} / ${work_info['st_subject']} / ${query.page}페이지 ${query.rank}위\n`
    } else {
        memoContent = `${work_info['st_memo'] ? work_info['st_memo'] : ""}${nowSrt} / ${work_info['st_subject']} / 순위권 내 없음!!\n`
    }

    try {
        const updateMemoQuery = "UPDATE site_traffic SET st_memo = ? WHERE st_id = ?";
        await sql_con.promise().query(updateMemoQuery, [memoContent, query.st_id]);
    } catch (error) {
        status = false;
    }

    res.json({ status })
})


resTrafficRouter.get('/load_rank_work_info', async (req, res, next) => {
    let status = true;
    let get_work_info = ""
    const query = req.query;

    try {
        const getWorkInfoQuery = "SELECT * FROM site_traffic WHERE st_id > ? AND st_use = TRUE ORDER BY st_id ASC LIMIT 1"
        const getWorkInfo = await sql_con.promise().query(getWorkInfoQuery, [query['work_count']]);
        get_work_info = getWorkInfo[0][0];
    } catch (error) {
        status = false
    }

    res.json({ status, get_work_info })
})


resTrafficRouter.get('/add_count_work', async (req, res, next) => {
    let status = true;
    const body = req.query;
    try {
        const st_id = body.st_id;
        delete body.st_id;
        const query = getQueryStr(body, 'update')
        query.values.push(st_id);
        const updateCountQuery = `UPDATE site_traffic SET ${query.str} WHERE st_id = ?`;
        await sql_con.promise().query(updateCountQuery, query.values);
    } catch (error) {
        console.error(error.message);
        status = false;
    }
    res.json({ status })
})


resTrafficRouter.get('/load_work_info', async (req, res, next) => {
    let status = true;

    let load_work_info = []
    try {
        const loadWorkInfoQuery = "SELECT * FROM site_traffic WHERE st_use = TRUE AND st_target_click_count > st_now_click_count;"
        const loadWorkInfo = await sql_con.promise().query(loadWorkInfoQuery);
        load_work_info = loadWorkInfo[0]
    } catch (error) {
        status = false;
    }
    res.json({ status, load_work_info })
})

export { resTrafficRouter }