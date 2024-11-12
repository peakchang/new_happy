import express from "express";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr, getRandomNumber, shuffle } from "../back-lib/lib.js";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const resTrafficLoopRouter = express.Router();


// 여기는 mix 부분!!!!!!!!!!!

resTrafficLoopRouter.use('/get_user_agent', async (req, res) => {
    let status = true;
    let user_agent_info = {}
    try {
        // user agent 값 전부 가져오기
        const getUserAgentListQuery = "SELECT * FROM user_agent WHERE ua_use = ?";
        const getUserAgentList = await sql_con.promise().query(getUserAgentListQuery, false);
        // 만약 false 로 된게 없으면 전부 false로 변경 해주기
        if(getUserAgentList[0].length == 0){
            const getUpdateUserAgentQuery = "UPDATE user_agent SET ua_use = ?"
            await sql_con.promise().query(getUpdateUserAgentQuery, false);
        }

        // 값 전부 가져 왔으면 
        const getUaRanNum = getRandomNumber(0, getUserAgentList[0].length)
        user_agent_info = getUserAgentList[0][getUaRanNum]

        const updateUserAgentTrueQuery = "UPDATE user_agent SET ua_use = ? WHERE ua_id = ?";
        await sql_con.promise().query(updateUserAgentTrueQuery, [true, user_agent_info['ua_id']]);
    } catch (err) {
        console.error(err.message);
    }
    res.json({ status, user_agent_info });
})









// 클릭(리얼클릭) 상태를 먼저 업데이트!!
resTrafficLoopRouter.use('/update_chk_realwork', async (req, res, next) => {
    let status = true;
    const body = req.body;
    const stId = body.st_id;
    try {
        const updateWorkStatus = "UPDATE site_traffic_plz SET st_realclick_status = TRUE WHERE st_id = ?";
        await sql_con.promise().query(updateWorkStatus, [stId]);
    } catch (error) {

    }
    res.json({ status });
})

// 조회수 작업 업데이트!!! work_status 가 False 면 st_use flase로 만들어주고 아니면 st_use true 로 / 노출 + 1 하기~~ 
resTrafficLoopRouter.post('/update_traffic_realwork', async (req, res, next) => {
    console.log('들어오는거니?');

    let status = true;
    const body = req.body;
    console.log(body);

    // 조회 작업이기 떄문에, work_status 가 True 면 st_use 는 true로, 노출수는 +1 한다. False 면 st_use를 false로 만들고 끝~
    try {
        if (body.work_status == 'False') {
            const updateFalseWorkQuery = "UPDATE site_traffic_plz SET st_use = ? WHERE st_id = ?";
            await sql_con.promise().query(updateFalseWorkQuery, [false, body['st_id']]);
        } else {
            const getSiteTrafficPlzInfoQuery = "SELECT * FROM site_traffic_plz WHERE st_id = ?";
            const getSiteTrafficPlzInfo = await sql_con.promise().query(getSiteTrafficPlzInfoQuery, [body['st_id']]);
            const siteTrafficPlzInfo = getSiteTrafficPlzInfo[0][0];
            let siteTrafficPlzUpdateQuery = ""
            siteTrafficPlzUpdateQuery = `UPDATE site_traffic_plz SET st_now_click_count = ?, st_use = ? WHERE st_id = ?`;
            await sql_con.promise().query(siteTrafficPlzUpdateQuery, [siteTrafficPlzInfo['st_now_click_count'] + 1, true, body['st_id']]);

        }
    } catch (error) {
        status = false;
    }

    res.json({ status });
})




resTrafficLoopRouter.get('/load_realwork', async (req, res, next) => {
    console.log('실제 클릭 부분!!! 들어오는거니?');

    let status = true;
    const query = req.query;

    let get_realwork = {};
    console.log(query);




    // 리얼 클릭 불러오는 부분!!!
    try {
        let load_realwork_expose_list = [];

        const loadWorkExposeListQuery = "SELECT * FROM site_traffic_plz WHERE st_use = TRUE AND st_realclick_status = FALSE AND (st_target_click_count = 'loop' OR st_target_click_count > st_now_click_count) AND st_group = ?";
        console.log(loadWorkExposeListQuery);

        const loadWorkExposeList = await sql_con.promise().query(loadWorkExposeListQuery, [query.group]);
        load_realwork_expose_list = loadWorkExposeList[0]

        if (load_realwork_expose_list.length == 0) {
            const updateClickStatusQuery = `UPDATE site_traffic_plz SET st_realclick_status = FALSE WHERE st_group = ?`;
            await sql_con.promise().query(updateClickStatusQuery, [query.group]);
            status = false;
        }

        if (load_realwork_expose_list.length > 0) {
            const shuffleLoadWorkExposeList = shuffle(load_realwork_expose_list);
            const sortedLoadWorkExposeList = shuffleLoadWorkExposeList.sort((a, b) => a.st_expose_count - b.st_expose_count);
            get_realwork = sortedLoadWorkExposeList[0]
        }

    } catch (error) {
        console.error(error.message);
        status = false;
    }

    res.json({ status, get_realwork });
})


// 조회수 작업 업데이트!!! work_status 가 False 면 st_use flase로 만들어주고 아니면 st_use true 로 / 노출 + 1 하기~~ 
resTrafficLoopRouter.post('/update_traffic_work', async (req, res, next) => {
    console.log('들어오는거니?');

    let status = true;
    const body = req.body;
    console.log(body);

    // 조회 작업이기 떄문에, work_status 가 True 면 st_use 는 true로, 노출수는 +1 한다. False 면 st_use를 false로 만들고 끝~
    try {
        if (body.work_status == 'False') {
            const updateFalseWorkQuery = "UPDATE site_traffic_plz SET st_use = ? WHERE st_id = ?";
            await sql_con.promise().query(updateFalseWorkQuery, [false, body['st_id']]);
        } else {
            const getSiteTrafficPlzInfoQuery = "SELECT * FROM site_traffic_plz WHERE st_id = ?";
            const getSiteTrafficPlzInfo = await sql_con.promise().query(getSiteTrafficPlzInfoQuery, [body['st_id']]);
            const siteTrafficPlzInfo = getSiteTrafficPlzInfo[0][0];
            let siteTrafficPlzUpdateQuery = ""
            siteTrafficPlzUpdateQuery = `UPDATE site_traffic_plz SET st_expose_count = ?, st_use = ? WHERE st_id = ?`;
            await sql_con.promise().query(siteTrafficPlzUpdateQuery, [siteTrafficPlzInfo['st_expose_count'] + 1, true, body['st_id']]);

        }
    } catch (error) {
        status = false;
    }

    res.json({ status });
})



// 클릭(조회) 상태를 먼저 업데이트!!
resTrafficLoopRouter.use('/update_chk_work', async (req, res, next) => {
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

// work reset만 하는곳!!!!
// resTrafficLoopRouter.get('/reset_work', async (req, res, next) => {
//     let status = true;
//     const body = req.query;
//     try {
//         const updateClickStatusQuery = `UPDATE site_traffic_plz SET st_click_status = FALSE WHERE st_group = ?`;
//         await sql_con.promise().query(updateClickStatusQuery, [body.group]);
//     } catch (error) {
//         console.error(error.message);
//         status = false;
//     }
//     res.json({ status });
// })

resTrafficLoopRouter.post('/duplicate_work_chk', async (req, res, next) => {

    let status = true;
    const body = req.body;
    try {
        const updateClickStatusQuery = `UPDATE site_traffic_plz SET st_click_status = TRUE WHERE st_id = ?`;
        await sql_con.promise().query(updateClickStatusQuery, [body.work_id]);
    } catch (error) {
        console.error(error.message);
        status = false;
    }
    res.json({ status });
})

// work 얻는곳 (조회 작업 할곳!!) 아무거나 하나 얻고, 전부 true 면 false로 변경, 쓰까서 하나 내보내기
resTrafficLoopRouter.get('/load_work', async (req, res, next) => {
    console.log('load_work_plz 일단 들어오고~~~');

    let status = true;
    const body = req.query;
    let get_work = {};

    console.log(body);

    try {
        let load_work_expose_list = [];

        const loadWorkExposeListQuery = "SELECT * FROM site_traffic_plz WHERE st_click_status = FALSE AND st_group = ?";
        const loadWorkExposeList = await sql_con.promise().query(loadWorkExposeListQuery, [body.group]);
        load_work_expose_list = loadWorkExposeList[0]

        console.log(load_work_expose_list);


        if (load_work_expose_list.length == 0) {
            console.log('초기와 들어옴!!!');

            const updateClickStatusQuery = `UPDATE site_traffic_plz SET st_click_status = FALSE WHERE st_group = ?`;
            await sql_con.promise().query(updateClickStatusQuery, [body.group]);
            status = false;
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

    res.json({ status, get_work });
})

// notWork 즉 키워드만 얻는 곳!!!
resTrafficLoopRouter.use('/load_notwork', async (req, res, next) => {
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
resTrafficLoopRouter.use('/get_profile', async (req, res, next) => {

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



export { resTrafficLoopRouter }