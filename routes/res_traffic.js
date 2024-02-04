import express from "express";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr } from "../back-lib/lib.js";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const resTrafficRouter = express.Router();

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