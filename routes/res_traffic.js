import express from "express";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr } from "../back-lib/lib.js";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const resTrafficRouter = express.Router();



// 그룹 트래픽 작업!!!!!!!!!!!!!!!!!!!!!!


resTrafficRouter.use('/get_profile_work_update', async (req, res, next) => {
    let status = true;

    const body = req.body;
    console.log(body);

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
    console.log(body);
    const pcId = body.pc_id;
    console.log(pcId);

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

    console.log(user_agent_count);
    res.json({ status, get_profile_work_list, user_agent_count });
})



resTrafficRouter.use('/update_onclick_link', async (req, res, next) => {
    let status = true;
    try {
        const getDbLinkQuery = "SELECT st_link FROM site_traffic_loop WHERE st_link = ?";
        const getDbLink = await sql_con.promise().query(getDbLinkQuery, req.body.link);
        const get_db_link_chk = getDbLink[0][0];
        console.log(get_db_link_chk);
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
    console.log('load group start~~~~~~~~~~~~~~~');
    let status = true;
    let work_info_list = []
    let user_agent_list = [];
    let all_work_info_list = [];

    const query = req.query
    let addQuery = ''
    if (query.group && query.group != 'None') {
        addQuery = `AND st_group = '${query.group}'`;
    }

    console.log(addQuery);
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
    console.log('update group start~~~~~~~~~~~~~~~');
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