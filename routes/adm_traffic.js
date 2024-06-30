import express from "express";
import bcrypt from "bcrypt";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr } from "../back-lib/lib.js";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const admTrafficRouter = express.Router();




// 무한 트래픽 작업!!!!!!!!!!!!

admTrafficRouter.post('/delete_last_traffic_row', async (req, res) => {
    let status = true;
    const body = req.body;
    console.log(body);
    const delList = body.deletedList;
    console.log(delList);
    for (let i = 0; i < delList.length; i++) {
        const ele = delList[i];
        try {
            const deleteLastTrafficQuery = "DELETE FROM last_traffic_chk WHERE lt_id = ?"
            await sql_con.promise().query(deleteLastTrafficQuery, [ele.lt_id]);
        } catch (error) {
            
        }
    }

    res.json({ status })
})

admTrafficRouter.get('/last_traffic_chk', async (req, res) => {
    let status = true;
    const body = req.body;
    let all_data = [];
    try {
        const getLastTrafficListQuery = `SELECT * FROM last_traffic_chk`;
        const getLastTrafficList = await sql_con.promise().query(getLastTrafficListQuery);
        all_data = getLastTrafficList[0];
    } catch (error) {
        status = false;
    }
    res.json({ status, all_data })
})

admTrafficRouter.post('/get_memo_content', async (req, res) => {
    let status = true;
    const body = req.body;
    let memo_content = ""
    try {
        const getMemoContentQuery = `SELECT ${body.memoType} FROM site_traffic_loop WHERE st_id = ?`;
        const getMemoContent = await sql_con.promise().query(getMemoContentQuery, [body['getStId']]);
        memo_content = getMemoContent[0][0][body.memoType];
    } catch (error) {
        status = false;
    }
    res.json({ status, memo_content })
})

admTrafficRouter.post('/delete_traffic_loop', async (req, res) => {
    let status = true;
    const body = req.body.deleteList;
    try {
        for (let i = 0; i < body.length; i++) {
            const deleteTrafficLoopQuery = `DELETE FROM site_traffic_loop WHERE st_id = ?`;
            await sql_con.promise().query(deleteTrafficLoopQuery, [body[i]]);
        }
    } catch (error) {
        status = false;
    }
    res.json({ status })
})

admTrafficRouter.post('/update_traffic_loop', async (req, res) => {
    let status = true;
    const body = req.body.updateList;
    try {
        for (let i = 0; i < body.length; i++) {
            const stId = body[i]['st_id'];
            delete body[i]['st_id']
            const queryStr = getQueryStr(body[i], 'update')
            const updateQueryStr = `UPDATE site_traffic_loop SET ${queryStr.str} WHERE st_id = ?`
            queryStr.values.push(stId)
            await sql_con.promise().query(updateQueryStr, queryStr.values);
        }
    } catch (error) {
        console.error(error.message);
        status = false;
    }
    res.json({ status })
})



admTrafficRouter.get('/load_traffic_loop', async (req, res) => {
    let status = true;
    let allData = [];
    let allCount = 0;

    try {
        const loadCountTrafficQuery = `SELECT COUNT(*) AS total_rows FROM site_traffic_loop;`
        const loadCountTraffic = await sql_con.promise().query(loadCountTrafficQuery);
        allCount = loadCountTraffic[0][0]['total_rows']
        const loadTrafficLoopQuery = `SELECT * FROM site_traffic_loop ORDER BY st_id DESC`;
        const loadTrafficLoop = await sql_con.promise().query(loadTrafficLoopQuery);
        allData = loadTrafficLoop[0];
    } catch (error) {

    }

    res.json({ status, allData, allCount })
})

admTrafficRouter.post('/add_row_traffic_loop', async (req, res) => {
    let status = true;
    const body = req.body.addTrafficValues;
    try {
        const queryStr = getQueryStr(body, 'insert')
        const trafficWorkInsertQuery = `INSERT INTO site_traffic_loop (${queryStr.str}) VALUES (${queryStr.question})`;
        await sql_con.promise().query(trafficWorkInsertQuery, queryStr.values);
    } catch (error) {
        status = false;
    }
    res.json({ status })
})









// 일반 트래픽 작업!!!!!!!!!!!!!

admTrafficRouter.post('/delete_row', async (req, res) => {
    let status = true;
    const deleteList = req.body.deleteList;

    for (let i = 0; i < deleteList.length; i++) {
        const stId = deleteList[i];
        try {
            const deleteListQuery = "DELETE FROM site_traffic WHERE st_id = ?"
            await sql_con.promise().query(deleteListQuery, [stId]);
        } catch (error) {
            status = false;
        }
    }



    res.json({ status })
})

admTrafficRouter.post('/initial_count', async (req, res) => {
    let status = true;
    try {
        const initialCountQuery = "UPDATE site_traffic SET st_now_click_count = 0";
        await sql_con.promise().query(initialCountQuery);
    } catch (error) {
        status = false;
    }

    res.json({ status })
})

admTrafficRouter.post('/update_data', async (req, res) => {
    let status = true;
    const body = req.body;
    for (let i = 0; i < body.length; i++) {
        try {
            const data = body[i];
            const st_id = data.st_id;
            delete data.st_id;
            const queryStr = getQueryStr(data, 'update')
            queryStr.values.push(st_id);
            const updateSqlQuery = `UPDATE site_traffic SET ${queryStr.str} WHERE st_id = ?`
            await sql_con.promise().query(updateSqlQuery, queryStr.values);
        } catch (error) {
            console.error(error.message);
        }

    }
    res.json({ status })
})
admTrafficRouter.post('/make_new_tarffic', async (req, res) => {
    let status = true;
    const body = req.body;
    try {
        const queryStr = getQueryStr(body, 'insert')
        const trafficWorkInsertQuery = `INSERT INTO site_traffic (${queryStr.str}) VALUES (${queryStr.question})`;
        await sql_con.promise().query(trafficWorkInsertQuery, queryStr.values);
    } catch (error) {
        status = false;
    }
    res.json({ status })
})


admTrafficRouter.post('/', async (req, res) => {
    let status = true;

    let body = req.body;


    let traffic_list = []
    try {
        let addQuery = ""
        if (body.useVal) {
            addQuery = addQuery + "WHERE st_use = TRUE"
        }
        const getTrafficListQuery = `SELECT * FROM site_traffic ${addQuery} ORDER BY st_id DESC`;
        const getTrafficList = await sql_con.promise().query(getTrafficListQuery);
        traffic_list = getTrafficList[0]
    } catch (error) {
        status = false;
    }

    res.json({ status, traffic_list })
})




export { admTrafficRouter }