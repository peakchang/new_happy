import express from "express";
import { sql_con } from '../back-lib/db.js'
import bcrypt from "bcrypt";
import cheerio from "cheerio";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const resCafeRouter = express.Router();

// 카페 작업을 할시, 카운트를 하나씩 올려 작업 안한 카페가 우선순위로 오게 한다!
resCafeRouter.use('/update_cafe_count', async (req, res, next) => {
    let status = true;
    const query = req.query
    console.log(query.get_id);
    try {
        const getCafeCountQuery = "SELECT cl_use_count FROM cafe_list WHERE cl_id = ?"
        const getCafeCount = await sql_con.promise().query(getCafeCountQuery, [query.get_id]);
        let cafeCount = getCafeCount[0][0]['cl_use_count']
        cafeCount = cafeCount + 1
        console.log(cafeCount);
        const updateCafeCountQuery = "UPDATE cafe_list SET cl_use_count = ? WHERE cl_id = ?";
        await sql_con.promise().query(updateCafeCountQuery, [cafeCount, query.get_id]);
    } catch (error) {
        status = false;
    }
    res.json({ status })
})

// 카페 작업시에 작업할 카페 뽑아주기
resCafeRouter.use('/get_cafe_info', async (req, res, next) => {
    let status = true;
    let get_cafe_list = []

    try {
        const getCafeListQuery = "SELECT * FROM cafe_list WHERE cl_use = TRUE";
        const getCafeList = await sql_con.promise().query(getCafeListQuery);
        get_cafe_list = getCafeList[0]
    } catch (error) {
        status = false;
    }

    console.log(get_cafe_list);


    res.json({ status, get_cafe_list })
})
resCafeRouter.use('/get_cafe_hit_link', async (req, res, next) => {
    console.log('들어는 안와?!?!');
    let status = true;
    let cafe_work_list = []
    try {
        const getCafeWorkListQuery = `SELECT * FROM cafe_worklist WHERE cw_worked_at >= DATE_SUB(NOW(), INTERVAL 3 DAY);`
        const getCafeWorkList = await sql_con.promise().query(getCafeWorkListQuery);
        cafe_work_list = getCafeWorkList[0]
    } catch (error) {
        status = false;
    }
    res.json({ status, cafe_work_list })
})

// 카페 조회수 및 댓글 작업할 아이디 불러오기
resCafeRouter.use('/get_cafe_hit_id', async (req, res, next) => {
    let status = true;
    let cafe_hit_id = {}
    try {
        const workReadyIdCountQuery = `SELECT COUNT(*) FROM nwork WHERE n_use = TRUE AND n_used = FALSE AND (n_cafe = FALSE OR n_cafe IS NULL) AND (n_blog_any = FALSE OR n_blog_any IS NULL);`
        const workReadyIdCountAct = await sql_con.promise().query(workReadyIdCountQuery);
        const workReadyIdCount = workReadyIdCountAct[0][0]['COUNT(*)'];

        const randomNumber = Math.floor(Math.random() * workReadyIdCount);

        const getCafeHitIdQuery = `SELECT * FROM nwork WHERE n_use = TRUE AND n_used = FALSE AND (n_cafe = FALSE OR n_cafe IS NULL) AND (n_blog_any = FALSE OR n_blog_any IS NULL) LIMIT 1 OFFSET ?;`
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
    let status = true;

    const getId = req.query.get_id
    const errMemo = req.query.err_memo
    const now = moment().format("YY/MM/DD HH:mm")
    const resMemo = `${now} ${errMemo} 체크!`
    try {
        const errUpdateQuery = "UPDATE nwork SET n_use = false, n_memo2 = ? WHERE n_id = ?";
        await sql_con.promise().query(errUpdateQuery, [resMemo, getId]);
    } catch (error) {
        status = false
    }
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