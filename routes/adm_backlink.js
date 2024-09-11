import express from "express";
import bcrypt from "bcrypt";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr } from "../back-lib/lib.js";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const admBackLinkRouter = express.Router();




admBackLinkRouter.post('/backlink_add_many_row', async (req, res) => {
    let status = true;
    const insertRows = req.body.formattedManyRowData;
    let errCount = 0
    for (let i = 0; i < insertRows.length; i++) {
        const row = insertRows[i];
        const queryStr = getQueryStr(row, 'insert')
        console.log(queryStr);


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
    let status = true;
    const bl_link = req.body.bl_link;
    let message = "";


    try {
        const insertBacklinkQuery = "INSERT INTO backlinks (bl_link) VALUES (?)";
        await sql_con.promise().query(insertBacklinkQuery, [bl_link]);
    } catch (error) {
        status = false;
        message = '링크가 중복됩니다.'
    }
    res.json({ status, message });
})

admBackLinkRouter.use('/backlink_get_list', async (req, res) => {
    let status = true;
    let backlink_list = [];
    try {
        const backlinkListQuery = "SELECT * FROM backlinks ORDER BY bl_id DESC";
        const backlinkList = await sql_con.promise().query(backlinkListQuery);
        backlink_list = backlinkList[0];
    } catch (error) {

    }
    res.json({ status, backlink_list });
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
    let status = "success";

    const data = req.body.updateData;


    for (let i = 0; i < data.length; i++) {
        try {
            const obj = data[i];
            const copiedObj = Object.assign({}, obj);
            delete copiedObj.tg_id;
            const objStr = getQueryStr(copiedObj, 'update');
            const updateQuery = `UPDATE target SET ${objStr.str} WHERE tg_id=?`;
            objStr.values.push(obj.tg_id);
            await sql_con.promise().query(updateQuery, objStr.values);
        } catch (error) {
            // console.error(error.message);
        }

    }
    res.json({ status });
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
        const targetListQuery = "SELECT * FROM target";
        const targetList = await sql_con.promise().query(targetListQuery);
        target_list = targetList[0];
    } catch (error) {

    }
    res.json({ status, target_list });
})


export { admBackLinkRouter }