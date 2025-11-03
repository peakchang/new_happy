import express from "express";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr, getRandomNumber, shuffle } from "../back-lib/lib.js";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const resTrafficWorkRouter = express.Router();


function getRandomMinWorkCountItem(array) {
    let minVal = 999999999;
    for (let i = 0; i < array.length; i++) {
        if (array[i].st_now_click_count < minVal) {
            minVal = array[i].st_now_click_count;
        }
    }
    const minItems = array.filter(item => item.st_now_click_count === minVal);
    const randomIndex = Math.floor(Math.random() * minItems.length);

    return minItems[randomIndex];
}


function pickRandomFromLowest4(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return null;

    const cloned = arr.slice(); // 원본 수정 방지
    cloned.sort((a, b) => {
        const av = Number(a?.st_now_click_count);
        const bv = Number(b?.st_now_click_count);
        if (!Number.isFinite(av) && !Number.isFinite(bv)) return 0;
        if (!Number.isFinite(av)) return 1;
        if (!Number.isFinite(bv)) return -1;
        return av - bv;
    });

    const pool = cloned.slice(0, Math.min(4, cloned.length));
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx] ?? null;
}


// 여기 allnew 부분!!! load_work / load_realwork 만 사용!!


resTrafficWorkRouter.post('/load_realwork_allnew', async (req, res, next) => {
    let status = true;
    const body = req.body;
    let get_realwork = {};

    if (body.work_type == 'pc') {
        // 리얼 클릭 PC 버전 불러오는 부분!!!
        try {
            let load_realwork_expose_list = [];

            const loadWorkExposeListQuery = "SELECT * FROM site_traffic_work WHERE st_use = TRUE AND st_expose_bool = TRUE AND st_pc_click_status = FALSE AND (st_target_click_count = 'loop' OR st_target_click_count > st_now_click_count) AND st_group = ?";

            const loadWorkExposeList = await sql_con.promise().query(loadWorkExposeListQuery, [body.group]);
            load_realwork_expose_list = loadWorkExposeList[0]

            if (load_realwork_expose_list.length < 2) {
                const updateClickStatusQuery = `UPDATE site_traffic_work SET st_pc_click_status = FALSE WHERE st_group = ?`;
                await sql_con.promise().query(updateClickStatusQuery, [body.group]);
                status = false;
            }

            if (load_realwork_expose_list.length > 0) {
                get_realwork = pickRandomFromLowest4(load_realwork_expose_list);
            }

            console.log(get_realwork);

            const updateRealClickPCQuery = `UPDATE site_traffic_work SET st_pc_click_status = ?, st_now_click_count = ?, st_expose_status = ? WHERE st_id = ?`;
            await sql_con.promise().query(updateRealClickPCQuery, [true, Number(get_realwork.st_now_click_count) + 1, true, get_realwork.st_id]);
            

        } catch (error) {
            console.error(error.message);
            status = false;
        }
    } else {
        // 리얼 클릭 mobile 버전 불러오는 부분!!!
        try {
            let load_realwork_expose_list = [];

            const loadWorkExposeListQuery = "SELECT * FROM site_traffic_work WHERE st_use = TRUE AND st_expose_bool = TRUE AND st_m_click_status = FALSE AND (st_target_click_count = 'loop' OR st_target_click_count > st_now_click_count) AND st_group = ?";

            const loadWorkExposeList = await sql_con.promise().query(loadWorkExposeListQuery, [body.group]);
            load_realwork_expose_list = loadWorkExposeList[0]

            if (load_realwork_expose_list.length == 0) {
                const updateClickStatusQuery = `UPDATE site_traffic_work SET st_m_click_status = FALSE WHERE st_group = ?`;
                await sql_con.promise().query(updateClickStatusQuery, [body.group]);
                status = false;
            }

            if (load_realwork_expose_list.length > 0) {
                const shuffleLoadWorkExposeList = shuffle(load_realwork_expose_list);
                get_realwork = shuffleLoadWorkExposeList[0]
            }


        } catch (error) {
            console.error(error.message);
            status = false;
        }
    }


    res.json({ status, get_realwork });
})





// work 얻는곳 (조회 작업 할곳!!) 아무거나 하나 얻고, 전부 true 면 false로 변경, 쓰까서 하나 내보내기
resTrafficWorkRouter.post('/load_work_allnew', async (req, res, next) => {

    let status = true;
    const body = req.body;
    let get_work = {};

    try {

        // 전체 작업 할 거 가지고 오기! (st_use / st_group 맞추고 expose_status (조회 상태) false 인걸로!)
        const getLoadWorkListQuery = "SELECT * FROM site_traffic_work WHERE st_use = TRUE AND st_group = ? AND st_expose_status = ?";
        const [getLoadWorkListAll] = await sql_con.promise().query(getLoadWorkListQuery, [body.group, false]);

        // 조회상태 false 인게 없으면 
        if (getLoadWorkListAll.length === 0) {
            const resetExpostStatusQuery = "UPDATE site_traffic_work SET st_expose_status = FALSE";
            await sql_con.promise().query(resetExpostStatusQuery);
            status = false
            return res.json({ status });
        }

        const ranNum = getRandomNumber(0, getLoadWorkListAll.length);
        get_work = getLoadWorkListAll[ranNum];

        console.log(get_work);
        console.log(get_work.st_expose_count);
        console.log(get_work.st_id);
        

        const updateWorkExposeStatusQuery = `UPDATE site_traffic_work SET st_expose_status = true, st_expose_count = ${Number(get_work.st_expose_count) + 1} WHERE st_id = ${get_work.st_id}`;

        console.log(updateWorkExposeStatusQuery);
        
        await sql_con.promise().query(updateWorkExposeStatusQuery);


    } catch (error) {
        console.error(error.message);
        status = false;
    }

    return res.json({ status, get_work });
})

// 여기는 mix 부분!!!!!!!!!!!

resTrafficWorkRouter.use('/get_user_agent', async (req, res) => {
    let status = true;
    let user_agent_info = {}
    try {
        // user agent 값 전부 가져오기
        const getUserAgentListQuery = "SELECT * FROM user_agent WHERE ua_use = ?";
        const getUserAgentList = await sql_con.promise().query(getUserAgentListQuery, [false]);
        // 만약 false 로 된게 없으면 전부 false로 변경 해주기
        if (getUserAgentList[0].length == 0) {
            const getUpdateUserAgentQuery = "UPDATE user_agent SET ua_use = ?"
            await sql_con.promise().query(getUpdateUserAgentQuery, [false]);
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



// notWork 즉 키워드만 얻는 곳!!!
resTrafficWorkRouter.use('/load_notwork', async (req, res, next) => {
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



// work 얻는곳 (조회 작업 할곳!!) 아무거나 하나 얻고, 전부 true 면 false로 변경, 쓰까서 하나 내보내기
resTrafficWorkRouter.post('/load_work', async (req, res, next) => {

    let status = true;
    const body = req.body;
    let get_work = {};

    try {

        // 전체 작업 할 거 가지고 오기! (st_use / st_group 맞추고 expose_status (조회 상태) false 인걸로!)
        const getLoadWorkListQuery = "SELECT * FROM site_traffic_work WHERE st_use = TRUE AND st_group = ? AND st_expose_status = ?";
        const [getLoadWorkListAll] = await sql_con.promise().query(getLoadWorkListQuery, [body.group, false]);

        // 조회상태 false 인게 없으면 
        if (getLoadWorkListAll.length === 0 || body.refresh == 'True') {
            const resetExpostStatusQuery = "UPDATE site_traffic_work SET st_expose_status = FALSE";
            await sql_con.promise().query(resetExpostStatusQuery);
            status = false
            return res.json({ status });
        }

        const ranNum = getRandomNumber(0, getLoadWorkListAll.length);
        get_work = getLoadWorkListAll[ranNum];

    } catch (error) {
        console.error(error.message);
        status = false;
    }

    return res.json({ status, get_work });
})



// 노출 작업 업데이트!!! work_status 가 False 면 st_use flase로 만들어주고 아니면 st_use true 로 / 노출 + 1 하기~~ 
resTrafficWorkRouter.post('/update_traffic_work', async (req, res, next) => {

    console.log('일단 들어옴?!');

    let status = true;
    const body = req.body;
    console.log(body);


    // 조회 작업이기 떄문에, work_status 가 True 면 노출수 +1 / 노출 상태 true 또는 false 맞게 변경 / 

    // 
    const getSiteTrafficPlzInfoQuery = "SELECT * FROM site_traffic_work WHERE st_id = ?";
    const getSiteTrafficPlzInfo = await sql_con.promise().query(getSiteTrafficPlzInfoQuery, [body['st_id']]);
    const siteTrafficPlzInfo = getSiteTrafficPlzInfo[0][0];

    try {
        if (body.status == 'True') {
            const siteTrafficPlzUpdateQuery = `UPDATE site_traffic_work SET st_expose_count = ?, st_expose_bool = ?, st_expose_status = ? WHERE st_id = ?`;
            await sql_con.promise().query(siteTrafficPlzUpdateQuery, [siteTrafficPlzInfo['st_expose_count'] + 1, true, true, body['st_id']]);

            try {

                console.log('조회수 입력 START!!!');


                // 1. 가장 최근 unique 의 데이터 가져오기
                const loadLatestsUniqueQuery = "SELECT * FROM site_rate WHERE sr_site_id = ? ORDER BY sr_unique DESC LIMIT 1";
                const [loadLatestsUnique] = await sql_con.promise().query(loadLatestsUniqueQuery, [body['st_id']]);

                console.log(loadLatestsUnique);
                console.log(loadLatestsUnique.length);
                console.log(loadLatestsUnique[0]['sr_rate']);
                console.log(body.rate);




                // 데이터가 없으면 1로 넣기
                if (loadLatestsUnique.length == 0) {
                    console.log('1번 여기 진입?');

                    const insertRateQuery = "INSERT INTO site_rate (sr_site_id, sr_rate, sr_unique) VALUES (?,?,?)";
                    await sql_con.promise().query(insertRateQuery, [body['st_id'], body.rate, 1]);
                } else if (loadLatestsUnique[0]['sr_rate'] != body.rate) {

                    console.log('2번 여기 진입?');
                    // 가장 최근 데이터의 rate 값이랑 지금 받은 rate 값이 다르면 넣기
                    const insertRateQuery = "INSERT INTO site_rate (sr_site_id, sr_rate, sr_unique) VALUES (?,?,?)";
                    await sql_con.promise().query(insertRateQuery, [body['st_id'], body.rate, Number(loadLatestsUnique[0]['sr_unique']) + 1]);
                }

            } catch (error) {
                console.error(error.message);
            }

        } else {
            const siteTrafficPlzUpdateQuery = `UPDATE site_traffic_work SET st_expose_bool = ?, st_expose_status = ? WHERE st_id = ?`;
            await sql_con.promise().query(siteTrafficPlzUpdateQuery, [false, true, body['st_id']]);
        }
    } catch (error) {
        console.error(error.message);
        status = false;
    }



    res.json({ status });
})




resTrafficWorkRouter.get('/load_realwork', async (req, res, next) => {
    let status = true;
    const query = req.query;
    let get_realwork = {};

    if (query.work_type == 'pc') {
        // 리얼 클릭 PC 버전 불러오는 부분!!!
        try {
            let load_realwork_expose_list = [];

            const loadWorkExposeListQuery = "SELECT * FROM site_traffic_work WHERE st_use = TRUE AND st_expose_bool = TRUE AND st_pc_click_status = FALSE AND (st_target_click_count = 'loop' OR st_target_click_count > st_now_click_count) AND st_group = ?";

            const loadWorkExposeList = await sql_con.promise().query(loadWorkExposeListQuery, [query.group]);
            load_realwork_expose_list = loadWorkExposeList[0]

            if (load_realwork_expose_list.length < 2) {
                const updateClickStatusQuery = `UPDATE site_traffic_work SET st_pc_click_status = FALSE WHERE st_group = ?`;
                await sql_con.promise().query(updateClickStatusQuery, [query.group]);
                status = false;
            }

            if (load_realwork_expose_list.length > 0) {
                get_realwork = pickRandomFromLowest4(load_realwork_expose_list);
            }

        } catch (error) {
            console.error(error.message);
            status = false;
        }
    } else {
        // 리얼 클릭 mobile 버전 불러오는 부분!!!
        try {
            let load_realwork_expose_list = [];

            const loadWorkExposeListQuery = "SELECT * FROM site_traffic_work WHERE st_use = TRUE AND st_expose_bool = TRUE AND st_m_click_status = FALSE AND (st_target_click_count = 'loop' OR st_target_click_count > st_now_click_count) AND st_group = ?";

            const loadWorkExposeList = await sql_con.promise().query(loadWorkExposeListQuery, [query.group]);
            load_realwork_expose_list = loadWorkExposeList[0]

            if (load_realwork_expose_list.length == 0) {
                const updateClickStatusQuery = `UPDATE site_traffic_work SET st_m_click_status = FALSE WHERE st_group = ?`;
                await sql_con.promise().query(updateClickStatusQuery, [query.group]);
                status = false;
            }

            if (load_realwork_expose_list.length > 0) {
                const shuffleLoadWorkExposeList = shuffle(load_realwork_expose_list);
                get_realwork = shuffleLoadWorkExposeList[0]
            }

        } catch (error) {
            console.error(error.message);
            status = false;
        }
    }


    res.json({ status, get_realwork });
})











// 조회수 작업 업데이트!!! work_status 가 False 면 st_use flase로 만들어주고 아니면 st_use true 로 / 노출 + 1 하기~~ 
resTrafficWorkRouter.post('/update_traffic_realwork', async (req, res, next) => {
    let status = true;
    const body = req.body;

    console.log(body);
    console.log(body['work_type']);


    let updateClickStatusRow = ""
    if (body['work_type'] == 'pc') {
        updateClickStatusRow = 'st_pc_click_status'
    } else {
        updateClickStatusRow = 'st_m_click_status'
    }

    console.log(`updateClickStatusRow : ${updateClickStatusRow}`);



    // 조회 작업이기 떄문에, work_status 가 True 면 노출수 +1 / 노출 상태 true 또는 false 맞게 변경 / 

    const getSiteTrafficPlzInfoQuery = "SELECT * FROM site_traffic_work WHERE st_id = ?";
    const getSiteTrafficPlzInfo = await sql_con.promise().query(getSiteTrafficPlzInfoQuery, [body['st_id']]);
    const siteTrafficPlzInfo = getSiteTrafficPlzInfo[0][0];


    console.log(`st_now_click_count : ${siteTrafficPlzInfo['st_now_click_count']}`);

    try {
        if (body.status == 'True') {
            const siteTrafficPlzUpdateQuery = `UPDATE site_traffic_work SET st_expose_count = ?, st_now_click_count = ?, ${updateClickStatusRow} = ?, st_expose_status = ? WHERE st_id = ?`;

            console.log(siteTrafficPlzUpdateQuery);

            await sql_con.promise().query(siteTrafficPlzUpdateQuery, [siteTrafficPlzInfo['st_expose_count'] + 1, siteTrafficPlzInfo['st_now_click_count'] + 1, true, true, body['st_id']]);

            try {
                // 1. 가장 최근 unique 의 데이터 가져오기
                const loadLatestsUniqueQuery = "SELECT * FROM site_rate WHERE sr_site_id = ? ORDER BY sr_unique DESC LIMIT 1";
                const [loadLatestsUnique] = await sql_con.promise().query(loadLatestsUniqueQuery, [body['st_id']]);

                // 데이터가 없으면 1로 넣기
                if (loadLatestsUnique.length == 0) {
                    const insertRateQuery = "INSERT INTO site_rate (sr_site_id, sr_rate, sr_unique) VALUES (?,?,?)";
                    await sql_con.promise().query(insertRateQuery, [body['st_id'], body.rate, 1]);
                } else if (loadLatestsUnique[0]['sr_rate'] != body.rate) {
                    // 가장 최근 데이터의 rate 값이랑 지금 받은 rate 값이 다르면 넣기
                    const insertRateQuery = "INSERT INTO site_rate (sr_site_id, sr_rate, sr_unique) VALUES (?,?,?)";
                    await sql_con.promise().query(insertRateQuery, [body['st_id'], body.rate, Number(loadLatestsUnique[0]['sr_unique']) + 1]);
                }

            } catch (err) {
                console.error(err.message);
            }

        } else {
            const siteTrafficPlzUpdateQuery = `UPDATE site_traffic_work SET st_expose_bool = ? WHERE st_id = ?`;
            await sql_con.promise().query(siteTrafficPlzUpdateQuery, [false, body['st_id']]);
        }
    } catch (err) {
        console.error(err.message);
        status = false;
    }

    res.json({ status });
})



resTrafficWorkRouter.use('/update_last_traffic', async (req, res) => {
    let status = true;
    let query = req.query;
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    try {
        const getTrafficInfoQuery = "SELECT * FROM last_traffic_chk WHERE lt_name = ?"
        const getTrafficInfo = await sql_con.promise().query(getTrafficInfoQuery, [query.sl_id]);
        if (getTrafficInfo[0][0]) {
            const updateTrafficQuery = "UPDATE last_traffic_chk SET lt_last_time =? WHERE lt_name =?";
            await sql_con.promise().query(updateTrafficQuery, [now, query.sl_id]);
        } else {
            const insertTrafficQuery = "INSERT INTO last_traffic_chk(lt_name, lt_last_time) VALUES(?,?)";
            await sql_con.promise().query(insertTrafficQuery, [query.sl_id, now]);
        }
    } catch (err) {
        console.error(err.message);
    }
    res.json({ status })
})




// *****************************---*-/*-/-*/-*/-*/-*/*-/*-/-/*-/*-/-*/*-/-*/-*/ 절삭!!


































resTrafficWorkRouter.get('/load_realwork', async (req, res, next) => {
    let status = true;
    const query = req.query;
    let get_realwork = {};

    // 리얼 클릭 불러오는 부분!!!
    try {
        let load_realwork_expose_list = [];

        const loadWorkExposeListQuery = "SELECT * FROM site_traffic_work WHERE st_use = TRUE AND st_m_realclick_status = FALSE AND (st_target_click_count = 'loop' OR st_target_click_count > st_now_click_count) AND st_group = ?";

        const loadWorkExposeList = await sql_con.promise().query(loadWorkExposeListQuery, [query.group]);
        load_realwork_expose_list = loadWorkExposeList[0]


        if (load_realwork_expose_list.length < 2) {
            const updateClickStatusQuery = `UPDATE site_traffic_work SET st_m_realclick_status = FALSE WHERE st_group = ?`;
            await sql_con.promise().query(updateClickStatusQuery, [query.group]);
            status = false;
        }

        if (load_realwork_expose_list.length > 0) {
            get_realwork = pickRandomFromLowest4(load_realwork_expose_list)
        }

    } catch (error) {
        console.error(error.message);
        status = false;
    }

    res.json({ status, get_realwork });
})

// 전체 작업 시작시 (한바퀴 돌때) 프로필 얻고 UserAgent 없으면 설정 하고 UserAgent 값 얻은 뒤 마지막 작업시간 표시하고 작업 진행~
resTrafficWorkRouter.use('/get_profile', async (req, res, next) => {

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
        const updateProfileLastworkedAtQuery = "UPDATE profile_list SET pl_lastworked_at = ?, pl_work_status = TRUE WHERE pl_id = ?";
        await sql_con.promise().query(updateProfileLastworkedAtQuery, [nowDateTime, work_profile.pl_id]);

        const getUserAgentQuery = "SELECT * FROM user_agent WHERE ua_id = ?";
        const getUserAgent = await sql_con.promise().query(getUserAgentQuery, [getUaNum]);
        user_agent = getUserAgent[0][0];

    } catch (error) {

        console.error(error.message);
        status = false;
    }

    res.json({ status, work_profile, user_agent, work_type });
})






// ***************-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-**-*-*-*-*-*


// 클릭(리얼클릭) 상태를 먼저 업데이트!!
resTrafficWorkRouter.use('/update_chk_realwork', async (req, res, next) => {

    let status = true;
    const body = req.body;
    const stId = body.st_id;
    const type = body.type;
    try {
        if (type == 'pc') {
            const updateWorkStatus = "UPDATE site_traffic_work SET st_realclick_status = TRUE WHERE st_id = ?";
            await sql_con.promise().query(updateWorkStatus, [stId]);
        } else {
            const updateWorkStatus = "UPDATE site_traffic_work SET st_m_realclick_status = TRUE WHERE st_id =?";
            await sql_con.promise().query(updateWorkStatus, [stId]);
        }

    } catch (error) {

    }
    res.json({ status });
})


resTrafficWorkRouter.post('/duplicate_work_chk', async (req, res, next) => {

    let status = true;
    const body = req.body;
    try {
        const updateClickStatusQuery = `UPDATE site_traffic_work SET st_click_status = TRUE WHERE st_id = ?`;
        await sql_con.promise().query(updateClickStatusQuery, [body.work_id]);
    } catch (error) {
        console.error(error.message);
        status = false;
    }
    res.json({ status });
})


// 클릭(조회) 상태를 먼저 업데이트!!
resTrafficWorkRouter.use('/update_chk_work', async (req, res, next) => {
    let status = true;
    const body = req.body;
    const stId = body.st_id;
    try {
        const updateWorkStatus = "UPDATE site_traffic_work SET st_click_status = TRUE WHERE st_id = ?";
        await sql_con.promise().query(updateWorkStatus, [stId]);
    } catch (error) {

    }
    res.json({ status });
})

export { resTrafficWorkRouter }