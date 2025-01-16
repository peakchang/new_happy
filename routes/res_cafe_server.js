import express from "express";
import { sql_con } from '../back-lib/db.js'
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const resCafeServerRouter = express.Router();


// 엑셀 작업시!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!





// 아이디 얻기!!! ()

resCafeServerRouter.use('/get_work_id', async (req, res, next) => {
    let status = true;
    let id_info = {}
    let uaNum = 0;
    let ua_info = {};

    const cafeId = req.body.cafeid;
    console.log(cafeId);
    try {
        const getCafeinfoQuery = "SELECT * FROM nwork WHERE n_idx = ?";
        const [getCafeInfo] = await sql_con.promise().query(getCafeinfoQuery, [cafeId]);
        console.log(getCafeInfo);
        id_info = getCafeInfo[0];
        uaNum = id_info.n_ua
        if (!uaNum) {
            // ua 테이블 길이 구하기!
            const getCountUaQuery = "SELECT COUNT(*) as ua_count FROM user_agent;";
            const [getCountUa] = await sql_con.promise().query(getCountUaQuery);
            const ua_count = getCountUa[0].ua_count;
            console.log(ua_count);

            uaNum = Math.floor(Math.random() * ua_count) + 1;
            const updateUaQuery = "UPDATE nwork SET n_ua =? WHERE n_idx =?";
            await sql_con.promise().query(updateUaQuery, [uaNum, cafeId]);
        }
        const getUaInfoQuery = `SELECT * FROM user_agent LIMIT ${uaNum - 1}, 1`;
        const [getUaInfo] = await sql_con.promise().query(getUaInfoQuery, [uaNum]);
        ua_info = getUaInfo[0];
    } catch (error) {

    }

    console.log(ua_info);

    res.json({ status, id_info, ua_info })
})



resCafeServerRouter.use('/cafework_update', async (req, res, next) => {
    let status = true;
    const query = req.query
    try {
        const now = moment().format('YYYY-MM-DD HH:mm:ss')
        const nowDate = moment().format('YYYY-MM-DD')
        const insertCafeWorkedLinkQuery = "INSERT INTO cafe_worklist (cw_link, cw_worked_at) VALUES (?,?)"
        await sql_con.promise().query(insertCafeWorkedLinkQuery, [query.worked_link, now]);

        const updateCafeIdWorkedQuery = "UPDATE nwork SET n_memo2 = ?, n_lastwork_at = ? WHERE n_idx = ?";
        await sql_con.promise().query(updateCafeIdWorkedQuery, [`${nowDate} 작업 완료`, now, query.worked_id]);
    } catch (error) {
        status = false;
        console.error(error.message);
    }
    res.json({ status });
})


// 엑셀 작업 끝!!!!!!!!!!!!!!!!!!!!!!!!!!!!!





// 글 작성시 카페 아이디 얻기
resCafeServerRouter.use('/get_cafework', async (req, res, next) => {
    let status = true;
    let workStatus = true;

    try {
        const getLatestWorkInfoQuery = "SELECT * FROM cafe_ready ORDER BY cr_work_date DESC LIMIT 1";
        const [getLatestWorkInfo] = await sql_con.promise().query(getLatestWorkInfoQuery);
        console.log(getLatestWorkInfo[0]);

        // 최근 1개 정보 불러옴! 아이디 불러오는데 UA값 없으면 업데이트!! 하고 다시 불러오기!!

    } catch (error) {

    }
    res.json({})
})


export { resCafeServerRouter }