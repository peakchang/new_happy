import express from "express";
import bcrypt from "bcrypt";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr } from "../back-lib/lib.js";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const nworkRouter = express.Router();


nworkRouter.use('/add_row', async (req, res) => {
    console.log('일단 들어는 올거 아냐?!');
    let status = true;
    const reqObj = req.body.reqObj;
    const exStr = getQueryStr(reqObj, 'insert');
    console.log(exStr);
    try {
        const insertIdQuery = `INSERT INTO nwork (${exStr.str}) VALUES (${exStr.question})`;
        await sql_con.promise().query(insertIdQuery, exStr.values);
    } catch (error) {
        console.error(error.message);
        status = false;
    }
    res.json({ status })
})

nworkRouter.use('/row_update', async (req, res) => {
    let status = 'success';
    const updateList = req.body.updateList
    console.log(updateList);
    for (let i = 0; i < updateList.length; i++) {
        const data = { ...updateList[i] };
        delete data.n_idx
        delete data.date_str
        delete data.n_lastwork_at

        const exStr = getQueryStr(data, 'update');
        exStr.values.push(updateList[i].n_idx);
        try {
            const updateQuery = `UPDATE nwork SET ${exStr.str} WHERE n_idx = ?`
            await sql_con.promise().query(updateQuery, exStr.values);
        } catch (error) {
            console.error(error.message);
        }
    }

    res.json({ status })
})

nworkRouter.use('/exupdate', async (req, res) => {
    let status = 'success';
    const exRow = req.body.ex_rows
    for (let i = 0; i < exRow.length; i++) {
        const exStr = getQueryStr(exRow[i], 'insert');
        try {
            const nInsertQuery = `INSERT INTO nwork (${exStr.str}) VALUES (${exStr.question})`;
            await sql_con.promise().query(nInsertQuery, exStr.values);
        } catch (error) {

        }
    }
    res.json({ status })
})


nworkRouter.use('/get_list', async (req, res) => {

    console.log(req.body.base);

    let status = 'success';
    let nwork_list = [];
    let all_count = 0;
    let maxPage = 0

    let setStart = 1

    let err_count = 0;
    let getQueryBase = req.body.base;
    let addQuery = ""
    let sortQuert = "";
    if (getQueryBase == 'n_blog_any') {
        sortQuert = "ORDER BY n_ch_profile ASC";
    }

    if (getQueryBase && getQueryBase != 'null' && getQueryBase != 'all') {
        if (getQueryBase == 'abnormal') {
            addQuery = `WHERE n_use = false`
        } else {
            addQuery = `WHERE ${getQueryBase} = true`
        }

    }

    if (!req.body.page || req.body.page == 0) {
        setStart = 1
    } else {
        setStart = req.body.page
    }
    let startVal = (setStart - 1) * 30

    console.log(addQuery);

    try {
        const allCountQuery = `SELECT COUNT(*) FROM nwork ${addQuery}`
        const allCount = await sql_con.promise().query(allCountQuery);
        all_count = allCount[0][0]['COUNT(*)']

        const errCountQuery = `SELECT COUNT(*) FROM nwork WHERE n_use = false`
        const errCount = await sql_con.promise().query(errCountQuery);
        err_count = errCount[0][0]['COUNT(*)']


        maxPage = Math.ceil(all_count / 30)

        const nworkListQuery = `SELECT * FROM nwork ${addQuery} ${sortQuert} LIMIT ?, 30`;
        const nworkList = await sql_con.promise().query(nworkListQuery, [startVal]);
        nwork_list = nworkList[0];
    } catch (error) {

    }
    res.json({ status, nwork_list, maxPage, all_count, err_count })
})


export { nworkRouter }