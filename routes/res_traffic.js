import express from "express";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr } from "../back-lib/lib.js";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const resTrafficRouter = express.Router();

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

    const nowSrt = moment().format('YYYY-MM-DD HH:mm')
    const memoContent = `${work_info['st_memo']}${nowSrt} / 에러! 순위 빠짐!\n`
    try {
        const errUpdateQuery = "UPDATE site_traffic SET st_memo = ? WHERE st_id = ?";
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
    }else{
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