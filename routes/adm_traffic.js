import express from "express";
import bcrypt from "bcrypt";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr } from "../back-lib/lib.js";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const admTrafficRouter = express.Router();

admTrafficRouter.post('/update_data', async (req, res) => {
    let status = true;
    const body = req.body;
    console.log(body);
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


admTrafficRouter.get('/', async (req, res) => {
    console.log('일단 들어오는지 체크~~');
    let status = true;

    let traffic_list = []
    try {
        const getTrafficListQuery = "SELECT * FROM site_traffic";
        const getTrafficList = await sql_con.promise().query(getTrafficListQuery);
        traffic_list = getTrafficList[0]
    } catch (error) {
        status = false;
    }

    res.json({ status, traffic_list })
})



export { admTrafficRouter }