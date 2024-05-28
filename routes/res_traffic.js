import express from "express";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr } from "../back-lib/lib.js";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const resTrafficRouter = express.Router();


// 무제한 트래픽 작업!!!!!!!!!!!!!!!!!!!!!

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
            console.log('메모가 추가해야 하는 경우 여기서 작업!!');
            let resMemo = ""
            if (latestRateMemo) {
                resMemo = getRateStr + latestRateMemo
            } else {
                resMemo = getRateStr
            }

            const updateRowQuery = "UPDATE site_traffic_loop SET st_now_click_count= ?, st_rate_memo = ?, st_click_bool = TRUE WHERE st_id = ?";
            await sql_con.promise().query(updateRowQuery, [query['st_now_click_count'], resMemo, query['st_id']]);
        } else {
            console.log('메모가 있을 경우 여기서 작업!!');
            const updateRowQuery = "UPDATE site_traffic_loop SET st_now_click_count= ?, st_click_bool = TRUE WHERE st_id = ?";
            await sql_con.promise().query(updateRowQuery, [query['st_now_click_count'], query['st_id']]);
        }


        const lastTrafficChkQuery = "SELECT * FROM last_traffic_chk WHERE lt_name = ?";
        const lastTrafficChk = await sql_con.promise().query(lastTrafficChkQuery, [query.pc_id]);
        const last_traffic_chk = lastTrafficChk[0][0];
        if(!last_traffic_chk){
            const insertLastTrafficQuery = "INSERT INTO last_traffic_chk (lt_name, lt_last_time) VALUES (?,?)";
            await sql_con.promise().query(insertLastTrafficQuery, [query.pc_id, nowDateTime]);
        }else{
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
    console.log('들어는 오는거야??');

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
    console.log('들어오는지 테스트요!!!!!!!!!!!!');
    let load_work_info = []
    try {
        const loadWorkInfoQuery = "SELECT * FROM site_traffic_loop WHERE st_use = TRUE AND st_click_bool = FALSE AND (st_target_click_count = 'loop' OR st_target_click_count > st_now_click_count);"
        const loadWorkInfo = await sql_con.promise().query(loadWorkInfoQuery);
        load_work_info = loadWorkInfo[0]

        if (load_work_info.length == 0) {
            const updateClickBoolQuery = "UPDATE site_traffic_loop SET st_click_bool = FALSE";
            await sql_con.promise().query(updateClickBoolQuery);
        }
    } catch (error) {
        console.error(error.message);
        status = false;
    }
    res.json({ status, load_work_info })
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
        console.log(nowSrt);
        const memoContent = `${work_info['st_memo']}${nowSrt} / 에러! 순위 빠짐!\n`
        const errUpdateQuery = "UPDATE site_traffic SET st_memo = ?, st_use = false WHERE st_id = ?";
        await sql_con.promise().query(errUpdateQuery, [memoContent, stId]);
    } catch (error) {
        status = false;
    }
    res.json({ status })
})


resTrafficRouter.get('/update_rank_memo', async (req, res, next) => {
    console.log('왜 들어오지도 않아?!!?!?!?');
    let status = true;
    const query = req.query;
    // query.st_id
    // query.rank

    console.log(query.status);

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

    console.log('완료 되었니이~~~~~~~~~~~~~');

    res.json({ status })
})


resTrafficRouter.get('/load_rank_work_info', async (req, res, next) => {
    let status = true;
    let get_work_info = ""
    const query = req.query;
    console.log(query);
    try {
        const getWorkInfoQuery = "SELECT * FROM site_traffic WHERE st_id > ? AND st_use = TRUE ORDER BY st_id ASC LIMIT 1"
        const getWorkInfo = await sql_con.promise().query(getWorkInfoQuery, [query['work_count']]);
        get_work_info = getWorkInfo[0][0];
    } catch (error) {
        status = false
    }

    console.log(get_work_info);
    res.json({ status, get_work_info })
})


resTrafficRouter.get('/add_count_work', async (req, res, next) => {
    console.log('여기여기여기요!!!!');
    let status = true;
    console.log(req.query);
    const body = req.query;
    try {
        const st_id = body.st_id;
        delete body.st_id;
        console.log(body);
        const query = getQueryStr(body, 'update')
        console.log(query);
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
    console.log('ㄴ이러ㅣ냥러ㅣ냐ㅓㄹㅇ');
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