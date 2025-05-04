import express from "express";
import bcrypt from "bcrypt";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr } from "../back-lib/lib.js";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const admBackLinkRouter = express.Router();

admBackLinkRouter.post('/initial_row', async (req, res) => {
    let status = true;

    try {
        const initialQuery = "UPDATE backlinks SET bl_status = true, bl_work_bool = false, bl_memo = NULL";
        await sql_con.promise().query(initialQuery);
    } catch (error) {
        status = false;
    }
    res.json({ status });
})




admBackLinkRouter.post('/backlink_add_many_row', async (req, res) => {
    let status = true;
    const insertRows = req.body.formattedManyRowData;
    let errCount = 0
    for (let i = 0; i < insertRows.length; i++) {
        const row = insertRows[i];
        const queryStr = getQueryStr(row, 'insert')

        try {
            const insertQuery = `INSERT INTO target (${queryStr.str}) VALUES (${queryStr.question})`;
            await sql_con.promise().query(insertQuery, queryStr.values);
        } catch (error) {
            console.error(error.message);
            errCount += 1;
        }

    }

    res.json({ status, errCount });
})


admBackLinkRouter.post('/backlink_add_row', async (req, res) => {
    let duplicateCount = 0
    const links = req.body.links
    for (let i = 0; i < links.length; i++) {
        const d = links[i];
        try {
            const insertBacklinkQuery = "INSERT INTO backlinks (bl_link,bl_board) VALUES (?,?)";
            await sql_con.promise().query(insertBacklinkQuery, [d.link, d.board]);
        } catch (error) {
            duplicateCount++
        }
    }
    res.json({ duplicateCount });
})

admBackLinkRouter.use('/backlink_get_list', async (req, res) => {

    console.log('여기는 들어 오자너?!');
    
    let backlink_list = [];
    let last_work_list = [];


    try {

        const getLastWorkListQuery = "SELECT * FROM backlink_last";
        [last_work_list] = await sql_con.promise().query(getLastWorkListQuery);
        const backlinkListQuery = "SELECT * FROM backlinks ORDER BY bl_id DESC";
        const bklist = await sql_con.promise().query(backlinkListQuery);
        console.log(bklist);
        
        [backlink_list] = await sql_con.promise().query(backlinkListQuery);
    } catch (error) {

    }

    console.log(backlink_list);

    res.json({ backlink_list, last_work_list });
})


admBackLinkRouter.use('/backlink_update', async (req, res) => {
    let status = true;
    const bodys = req.body.updateArr;

    try {
        for (let i = 0; i < bodys.length; i++) {
            const body = bodys[i];
            const bl_id = body.bl_id;
            delete body.bl_id;
            const queryStr = getQueryStr(body, 'update');
            queryStr.values.push(bl_id)
            const updateQuery = `UPDATE backlinks SET ${queryStr.str} WHERE bl_id = ?`
            await sql_con.promise().query(updateQuery, queryStr.values);
        }
    } catch (error) {
        console.error(error.message);
        status = false;
    }

    res.json({ status });
})


admBackLinkRouter.use('/backlink_delete_row', async (req, res) => {

    let status = true;

    const idList = req.body.deleteIdArr
    try {
        for (let i = 0; i < idList.length; i++) {
            const id = idList[i];
            const deleteQuery = "DELETE FROM backlinks WHERE bl_id = ?";
            await sql_con.promise().query(deleteQuery, [id]);
        }
    } catch (error) {
        status = false;
        console.error(error.message);
    }


    res.json({ status });

})

















admBackLinkRouter.use('/get_work_list', async (req, res) => {
    let status = 'success';
    let errMessage = ""
    let work_list = [];
    const getDate = req.body.getDate
    let startOfDayString = ""
    let endOfDayString = ""

    if (!getDate) {
        const now = moment();

        const startOfDay = now.startOf('day');
        startOfDayString = startOfDay.format("YYYY-MM-DD HH:mm:ss");

        const endOfDay = now.endOf('day');
        endOfDayString = endOfDay.format("YYYY-MM-DD HH:mm:ss");
    } else {
        startOfDayString = `${getDate} 00:00:00`
        endOfDayString = `${getDate} 23:59:59`
    }

    try {
        const getWorkListQuery = `SELECT * FROM backlink_works WHERE bw_created_at >= ? AND bw_created_at <= ?`
        const getWorkList = await sql_con.promise().query(getWorkListQuery, [startOfDayString, endOfDayString]);
        work_list = getWorkList[0];
    } catch (error) {
        status = 'fail';
        errMessage = error.message
    }
    res.json({ status, work_list })
})

// 타겟 관련!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

admBackLinkRouter.use('/target_delete_row', async (req, res) => {
    let status = 'success';
    const deleteArr = req.body.deleteArr
    for (let i = 0; i < deleteArr.length; i++) {
        try {
            const delNum = deleteArr[i];
            const deleteQuery = "DELETE FROM target WHERE tg_id = ?"
            await sql_con.promise().query(deleteQuery, [delNum]);
        } catch (error) {

        }
    }
    res.json({ status })
})

admBackLinkRouter.use('/target_count_reset', async (req, res) => {
    let status = true;

    try {
        const resetTargetCountQuery = "UPDATE target SET tg_workcount = 0";
        await sql_con.promise().query(resetTargetCountQuery);

    } catch (error) {
        status = false;
    }

    res.json({ status })
})

admBackLinkRouter.use('/target_update', async (req, res) => {
    const data = req.body.updateData;
    for (let i = 0; i < data.length; i++) {
        const upData = data[i];
        const tgId = upData['tg_id']
        delete upData.tg_id
        const objStr = getQueryStr(data[i], 'update');

        try {
            const updateQuery = `UPDATE target SET ${objStr.str} WHERE tg_id=?`;
            objStr.values.push(tgId);
            await sql_con.promise().query(updateQuery, objStr.values);
        } catch (error) {
            // console.error(error.message);
        }

    }
    res.json({});
})

admBackLinkRouter.use('/target_add_row', async (req, res) => {
    let status = "success";
    const data = req.body
    const objStr = getQueryStr(data, 'insert')
    try {
        const addRowQuery = `INSERT INTO target (${objStr.str}) VALUES (${objStr.question})`;
        await sql_con.promise().query(addRowQuery, objStr.values);
    } catch (error) {

    }
    res.json({ status });
})

admBackLinkRouter.use('/target_get_list', async (req, res) => {
    let status = "success";
    let target_list = [];
    try {
        const targetListQuery = "SELECT * FROM target ORDER BY tg_group ASC";
        const targetList = await sql_con.promise().query(targetListQuery);
        target_list = targetList[0];
    } catch (error) {

    }
    res.json({ status, target_list });
})


export { admBackLinkRouter }