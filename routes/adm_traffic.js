import express from "express";
import bcrypt from "bcrypt";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr } from "../back-lib/lib.js";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const admTrafficRouter = express.Router();

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
    console.log('일단 들어오는지 체크~~');
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