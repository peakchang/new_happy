import express from "express";
import bcrypt from "bcrypt";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr } from "../back-lib/lib.js";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const admCafeRouter = express.Router();



// 카페작업 ready!!!!

admCafeRouter.post('/update_excel_cafe_ready', async (req, res) => {
    const exUploadArr = req.body.ex_rows;
    console.log(exUploadArr);
    for (let i = 0; i < exUploadArr.length; i++) {
        try {
            const data = exUploadArr[i];
            const queryStr = getQueryStr(data, 'insert')
            console.log(queryStr);
            const insertQuery = `INSERT INTO cafe_ready (${queryStr.str}) VALUES (${queryStr.question})`;
            await sql_con.promise().query(insertQuery, queryStr.values);
        } catch (error) {
            console.error(error.message);
        }
    }

    res.json({})
})


admCafeRouter.post('/update_work_ready', async (req, res) => {
    const body = req.body;
    console.log(body);

    // insert 일때 처리!!!
    let insertKeyStr = ""
    let questionStr = ""
    let insertValues = [];

    // update 일때 처리!!
    let updateKeyStr = "";
    let updateValues = [];

    try {

        if (body.cr_id) {

            const setCrId = body.cr_id
            delete body.cr_id
            for (const key in body) {
                if (key != "contentVars") {
                    updateKeyStr += `${key} = ?,`
                    updateValues.push(body[key])
                }
            }
            for (const key in body.contentVars) {
                if (key != "contentVars") {
                    updateKeyStr += `${key} = ?,`
                    updateValues.push(body.contentVars[key])
                }
            }

            if (updateKeyStr.endsWith(",")) {
                updateKeyStr = updateKeyStr.slice(0, -1); // 마지막 문자 제거
            }

            const updateCafeReadyDataQuery = `UPDATE cafe_ready SET ${updateKeyStr} WHERE cr_id = ${setCrId}`;
            await sql_con.promise().query(updateCafeReadyDataQuery, updateValues);


            console.log(updateCafeReadyDataQuery);
            console.log(updateValues);


        } else {
            for (const key in body) {
                if (key != "contentVars") {
                    insertKeyStr += `${key},`
                    questionStr += `?,`
                    insertValues.push(body[key])
                }
            }
            for (const key in body.contentVars) {
                if (key != "contentVars") {
                    insertKeyStr += `${key},`
                    questionStr += `?,`
                    insertValues.push(body.contentVars[key])
                }
            }
            if (insertKeyStr.endsWith(",")) {
                insertKeyStr = insertKeyStr.slice(0, -1); // 마지막 문자 제거
            }
            if (questionStr.endsWith(",")) {
                questionStr = questionStr.slice(0, -1); // 마지막 문자 제거
            }
            const insertCafeReadyDataQuery = `INSERT INTO cafe_ready (${insertKeyStr}) VALUES (${questionStr})`;
            console.log(insertCafeReadyDataQuery);

            await sql_con.promise().query(insertCafeReadyDataQuery, insertValues);
        }

    } catch (error) {
        console.error(error.message);

    }

    res.json({})
})


// 아이디 / 카페 리스트 불러오기

admCafeRouter.post('/load_cafeready_data', async (req, res) => {


    let cafe_id_list = [];
    let cafe_list = [];
    let cafe_work_ready_list = [];
    try {
        const loadCafeIdListQuery = "SELECT * FROM nwork WHERE n_cafe = ?"
        const loadCafeIdList = await sql_con.promise().query(loadCafeIdListQuery, [true]);
        cafe_id_list = loadCafeIdList[0]

        const loadCafeListQuery = "SELECT * FROM cafe_list";
        const loadCafeList = await sql_con.promise().query(loadCafeListQuery);
        cafe_list = loadCafeList[0]

        const loadCafeWorkReadyListQuery = "SELECT * FROM cafe_ready ORDER BY cr_id DESC";
        const loadCafeWorkReadyList = await sql_con.promise().query(loadCafeWorkReadyListQuery);
        cafe_work_ready_list = loadCafeWorkReadyList[0]
    } catch (error) {
        console.error(error.message);
    }

    res.json({ cafe_id_list, cafe_list, cafe_work_ready_list })
})


// 카페작업 ready 끝!!!!



admCafeRouter.post('/delete_cafe_reply', async (req, res) => {
    let status = true;
    const deleteList = req.body.checkedList
    for (let i = 0; i < deleteList.length; i++) {
        const data = deleteList[i];
        try {
            const deleteReplyQuery = "DELETE FROM cafe_reply WHERE cr_id = ?";
            await sql_con.promise().query(deleteReplyQuery, [data]);
        } catch (error) {
            status = false;
        }
    }
    res.json({ status })
})

admCafeRouter.post('/load_cafe_reply_list', async (req, res) => {
    let status = true;
    let cafe_reply_list = [];
    try {
        const getCafeReplyListQuery = "SELECT * FROM cafe_reply ORDER BY cr_id DESC";
        const getCafeReplyList = await sql_con.promise().query(getCafeReplyListQuery);
        cafe_reply_list = getCafeReplyList[0]
    } catch (error) {
        status = false;
    }
    res.json({ status, cafe_reply_list })
})
admCafeRouter.post('/add_cafe_reply', async (req, res) => {
    let status = true;

    const getReply = req.body.addReply
    try {
        const addReplyQuery = "INSERT INTO cafe_reply (cr_content) VALUES (?)";
        await sql_con.promise().query(addReplyQuery, [getReply]);
    } catch (error) {
        status = false;
    }

    res.json({ status })
})

admCafeRouter.post('/load_cafe_work_list', async (req, res) => {
    let status = true;

    const today = moment().format('YYYY-MM-DD');

    const threeDaysAgo = moment(today).subtract(3, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const todayMidnight = moment(today).endOf('day').format('YYYY-MM-DD HH:mm:ss');

    let cafe_work_list = []

    try {
        const getCafeWorkListQuery = `SELECT * FROM cafe_worklist WHERE cw_worked_at >= '${threeDaysAgo}' AND cw_worked_at <= '${todayMidnight}' ORDER BY cw_id DESC`;
        const getCafeWorkList = await sql_con.promise().query(getCafeWorkListQuery);
        cafe_work_list = getCafeWorkList[0];

        if (cafe_work_list.length == 0) {
            const getCafeWorkListQuery = `SELECT * FROM cafe_worklist ORDER BY cw_id DESC LIMIT 0, 40 `;
            const getCafeWorkList = await sql_con.promise().query(getCafeWorkListQuery);
            cafe_work_list = getCafeWorkList[0]
        }

    } catch (error) {

    }

    res.json({ status, cafe_work_list })
})

admCafeRouter.post('/delete_cafe_work_list', async (req, res) => {
    let status = true;

    const deleteList = req.body.deleteList;
    for (let i = 0; i < deleteList.length; i++) {
        const cw_id = deleteList[i]['cw_id'];
        try {
            const deleteCafeListQuery = "DELETE FROM cafe_worklist WHERE cw_id = ?";
            await sql_con.promise().query(deleteCafeListQuery, [cw_id]);
        } catch (error) {
            console.error(error.message);
            status = false;
        }
    }

    res.json({ status });
})




admCafeRouter.post('/delete_cafe_list', async (req, res) => {

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