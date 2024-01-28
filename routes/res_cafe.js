import express from "express";
import { sql_con } from '../back-lib/db.js'
import bcrypt from "bcrypt";
import cheerio from "cheerio";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const resCafeRouter = express.Router();


resCafeRouter.use('/get_cafe_hit_id', async (req, res, next) => {
    let status = true;
    let cafe_hit_id = {}
    try {
        const workReadyIdCountQuery = `SELECT COUNT(*) FROM nwork WHERE n_lastwork_at <= DATE_SUB(NOW(), INTERVAL 3 DAY) AND n_use = TRUE AND (n_cafe = FALSE OR n_cafe IS NULL) AND (n_blog_any = FALSE OR n_blog_any IS NULL);`
        const workReadyIdCountAct = await sql_con.promise().query(workReadyIdCountQuery);
        const workReadyIdCount = workReadyIdCountAct[0][0]['COUNT(*)'];

        const randomNumber = Math.floor(Math.random() * workReadyIdCount);

        const getCafeHitIdQuery = `SELECT * FROM nwork WHERE n_lastwork_at <= DATE_SUB(NOW(), INTERVAL 3 DAY) AND n_use = TRUE AND (n_cafe = FALSE OR n_cafe IS NULL) AND (n_blog_any = FALSE OR n_blog_any IS NULL) LIMIT 1 OFFSET ?;`
        const getCafeHitId = await sql_con.promise().query(getCafeHitIdQuery, [randomNumber]);
        cafe_hit_id = getCafeHitId[0][0]

    } catch (error) {
        status = false;
        console.error(error.message);
    }
    res.json({ status, cafe_hit_id })
})


// 이건 뭐더라?? 안쓸거 같은디?
resCafeRouter.use('/normal_chk', async (req, res, next) => {
    let status = "success";
    const getId = req.query.get_id;
    const getUa = req.query.ua

    try {
        var now = moment(Date.now()).format('YYYY-MM-DD');
        const updateUserWork = `UPDATE nwork SET n_lastwork_at = ?, n_ua = ? WHERE n_id = ?`;
        await sql_con.promise().query(updateUserWork, [now, getUa, getId]);
    } catch (error) {

    }
    res.json({ status })
})

// 조회수 작업시에 로그인 실패시 해당 내용 업데이트
resCafeRouter.use('/err_id_chk', async (req, res, next) => {
    let status = "success";

    const getId = req.query.get_id
    const errMemo = req.query.err_memo
    try {
        const errUpdateQuery = "UPDATE nwork SET n_use = false, n_memo2 = ? WHERE n_id = ?";
        await sql_con.promise().query(errUpdateQuery, [errMemo, getId]);
    } catch (error) {

    }
    res.json({ status })
})


// 조회수 작업할 카페 아이디 얻기
resCafeRouter.use('/get_cafe_hit_id', async (req, res, next) => {
    let status = true;

    res.json({ status })
})

// 글 작성 후 작업한 카페 주소 업데이트
resCafeRouter.use('/cafework_update', async (req, res, next) => {
    let status = true;
    console.log(req.query.worked_link);
    const query = req.query
    try {
        const now = moment().format('YYYY-MM-DD HH:mm:ss')
        const insertCafeWorkedLinkQuery = "INSERT INTO cafe_worklist (cw_link, cw_worked_at) VALUES (?,?)"
        await sql_con.promise().query(insertCafeWorkedLinkQuery, [query.worked_link, now]);
    } catch (error) {
        status = false;
        console.error(error.message);
    }
    res.json({ status });
})

// 글 작성시 카페 아이디 얻기
resCafeRouter.use('/get_cafework_id', async (req, res, next) => {
    let status = true;
    console.log('일단 여기는 들어오겠쥬? ');

    console.log(req.query);
    const query = req.query
    let get_cafe_info = {}
    try {
        const getCafeInfoQuery = "SELECT * FROM nwork WHERE n_cafe=TRUE AND n_ch_profile = ?;"
        const getCafeInfo = await sql_con.promise().query(getCafeInfoQuery, [query.profile]);
        get_cafe_info = getCafeInfo[0][0];
        if (!get_cafe_info) {
            console.log("profile search fail!!!");
            status = false;
        }
    } catch (error) {
        status = false;
        console.error(error.message);
    }
    res.json({ status, get_cafe_info })
})


export { resCafeRouter }