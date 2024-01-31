import express from "express";
import bcrypt from "bcrypt";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr } from "../back-lib/lib.js";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const admCafeRouter = express.Router();



admCafeRouter.post('/delete_cafe_list', async (req, res) => {

    console.log('삭제로는 들어와야지?!?!?!?');
    let status = true;

    const deleteList = req.body.deleteList;
    for (let i = 0; i < deleteList.length; i++) {
        const cl_id = deleteList[i];
        try {
            const deleteCafeListQuery = "DELETE FROM cafe_list WHERE cl_id = ?";
            await sql_con.promise().query(deleteCafeListQuery, [cl_id]);
        } catch (error) {
            console.error(error.message);
            status = false;
        }
    }

    res.json({ status });
})

admCafeRouter.post('/update_cafe_list', async (req, res) => {
    let status = true;

    const updateList = req.body.updateList
    for (let i = 0; i < updateList.length; i++) {
        let data = updateList[i];
        const cl_id = data.cl_id;
        delete data.cl_id;

        const queryStr = getQueryStr(data, 'update');
        queryStr.values.push(cl_id)
        try {
            const updateQuery = `UPDATE cafe_list SET ${queryStr.str} WHERE cl_id = ?`;
            await sql_con.promise().query(updateQuery, queryStr.values);
        } catch (error) {
            status = false;
        }

    }

    res.json({ status });
})

admCafeRouter.get('/load_cafe_list', async (req, res) => {
    let status = true;


    let cafe_list = []
    try {
        const loadCafeListQuery = "SELECT * FROM cafe_list";
        const loadCafeList = await sql_con.promise().query(loadCafeListQuery);
        cafe_list = loadCafeList[0];

    } catch (error) {
        console.error(error.message);
        status = false;
    }

    res.json({ status, cafe_list });
})

admCafeRouter.post('/add_cafe', async (req, res) => {
    let status = true;

    let body = req.body;

    try {
        const queryStr = getQueryStr(body, 'insert')
        const insertCafeQuery = `INSERT INTO cafe_list (${queryStr.str}) VALUES (${queryStr.question})`;
        await sql_con.promise().query(insertCafeQuery, queryStr.values);
    } catch (error) {
        status = false;
    }



    res.json({ status });
})




export { admCafeRouter }