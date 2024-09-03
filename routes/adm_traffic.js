import express from "express";
import bcrypt from "bcrypt";
import { sql_con } from '../back-lib/db.js'
import { getQueryStr } from "../back-lib/lib.js";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const admTrafficRouter = express.Router();

// plz plz plz plz 한번 되었었잖아 제발!!!





admTrafficRouter.post('/update_group', async (req, res) => {
    let status = true;
    const body = req.body;
    try {
        const updateGroupQuery = 'UPDATE site_traffic_plz SET st_work_type = ? WHERE st_group = ?';
        await sql_con.promise().query(updateGroupQuery, [body.groupType, body.group]);
    } catch (error) {
        status = false;
    }
    res.json({ status })
})


admTrafficRouter.post('/reset_profile_status', async (req, res) => {
    let status = true;
    const prName = req.body.pr_name;

    console.log(prName);
    console.log('안들어와?!');

    try {
        const resetProfileStatusQuery = "UPDATE profile_list SET pl_work_status = FALSE WHERE pl_name = ?";
        await sql_con.promise().query(resetProfileStatusQuery, [prName]);
    } catch (error) {
        status = false;
    }
    res.json({ status })
})


admTrafficRouter.post('/update_profiles', async (req, res) => {
    let status = true;

    const updateProfileDatas = req.body.profiles;
    console.log(updateProfileDatas);


    for (let i = 0; i < updateProfileDatas.length; i++) {
        const updateData = updateProfileDatas[i];

        const pr_id = updateData.pr_id;
        delete updateData.pr_id;
        const queryStr = getQueryStr(updateData, 'update')
        console.log(queryStr);

        queryStr.values.push(pr_id)
        try {
            const updateProfilesQuery = `UPDATE profile SET ${queryStr.str} WHERE pr_id = ?`;
            await sql_con.promise().query(updateProfilesQuery, queryStr.values);
        } catch (error) {
            console.error(error.message);
        }
    }
    res.json({ status })
})

admTrafficRouter.post('/update_profile_row', async (req, res) => {
    let status = true;

    const body = req.body;

    for (let i = 0; i < body.checkedList.length; i++) {
        const updateData = body.checkedList[i];
        console.log(updateData);

        try {
            const updateQuery = "UPDATE profile_list SET pl_work_status = ? WHERE pl_id = ?";
            await sql_con.promise().query(updateQuery, [updateData['pl_work_status'], updateData['pl_id']]);
        } catch (error) {
            status = false;
        }
    }
    res.json({ status })
})


admTrafficRouter.post('/delte_profile_row', async (req, res) => {
    let status = true;

    const body = req.body;

    for (let i = 0; i < body.deleteList.length; i++) {
        const delNum = body.deleteList[i];

        try {
            const deleteQuery = "DELETE FROM profile_list WHERE pl_id = ?";
            await sql_con.promise().query(deleteQuery, [delNum]);
        } catch (error) {

        }
    }
    res.json({ status })
})





// 현재 클릭 초기화
admTrafficRouter.get('/reset_now_click', async (req, res) => {
    let status = true;

    try {
        const resetNowClickQuery = "UPDATE site_traffic_plz SET st_now_click_count = 0";
        await sql_con.promise().query(resetNowClickQuery);
    } catch (error) {
        status = false;
    }

    res.json({ status })
})


// 여러줄 추가 할때
admTrafficRouter.post('/add_many_row_traffic_plz', async (req, res) => {
    let status = true;
    const datas = req.body.formattedManyRowData;

    for (let i = 0; i < datas.length; i++) {
        const data = datas[i];
        try {
            const queryStr = getQueryStr(data, 'insert')
            const trafficWorkInsertQuery = `INSERT INTO site_traffic_plz (${queryStr.str}) VALUES (${queryStr.question})`;
            await sql_con.promise().query(trafficWorkInsertQuery, queryStr.values);
        } catch (error) {
            status = false;
        }
    }

    res.json({ status })
})





admTrafficRouter.post('/delete_traffic_plz', async (req, res) => {
    let status = true;
    const body = req.body.deleteList;
    try {
        for (let i = 0; i < body.length; i++) {
            const deleteTrafficLoopQuery = `DELETE FROM site_traffic_plz WHERE st_id = ?`;
            await sql_con.promise().query(deleteTrafficLoopQuery, [body[i]]);
        }
    } catch (error) {
        status = false;
    }
    res.json({ status })
})

admTrafficRouter.post('/update_traffic_plz', async (req, res) => {
    let status = true;
    const body = req.body.updateList;
    console.log(body);
    console.log('일단 업데이트는 들어와?!?!');
    try {
        for (let i = 0; i < body.length; i++) {
            const stId = body[i]['st_id'];
            delete body[i]['st_id']
            const queryStr = getQueryStr(body[i], 'update')
            const updateQueryStr = `UPDATE site_traffic_plz SET ${queryStr.str} WHERE st_id = ?`

            console.log(updateQueryStr);
            queryStr.values.push(stId)
            await sql_con.promise().query(updateQueryStr, queryStr.values);
        }
    } catch (error) {
        console.log('raised error?!?!?!');
        console.error(error.message);
        status = false;
    }
    res.json({ status })
})



admTrafficRouter.post('/add_row_traffic_plz', async (req, res) => {
    let status = true;
    const body = req.body.addTrafficValues;
    try {
        const queryStr = getQueryStr(body, 'insert')
        const trafficWorkInsertQuery = `INSERT INTO site_traffic_plz (${queryStr.str}) VALUES (${queryStr.question})`;
        await sql_con.promise().query(trafficWorkInsertQuery, queryStr.values);
    } catch (error) {
        status = false;
    }
    res.json({ status })
})

admTrafficRouter.post('/load_traffic_plz', async (req, res) => {
    let status = true;
    let allData = [];
    let allCount = 0;

    try {
        const loadCountTrafficQuery = `SELECT COUNT(*) AS total_rows FROM site_traffic_plz;`
        const loadCountTraffic = await sql_con.promise().query(loadCountTrafficQuery);
        allCount = loadCountTraffic[0][0]['total_rows']
        const loadTrafficLoopQuery = `SELECT * FROM site_traffic_plz ORDER BY st_id DESC`;
        const loadTrafficLoop = await sql_con.promise().query(loadTrafficLoopQuery);
        allData = loadTrafficLoop[0];
    } catch (error) {

    }

    res.json({ status, allData, allCount })
})


admTrafficRouter.get('/load_traffic_plz', async (req, res) => {
    let status = true;
    let allData = [];
    let allCount = 0;

    try {
        const loadCountTrafficQuery = `SELECT COUNT(*) AS total_rows FROM site_traffic_plz;`
        const loadCountTraffic = await sql_con.promise().query(loadCountTrafficQuery);
        allCount = loadCountTraffic[0][0]['total_rows']
        const loadTrafficLoopQuery = `SELECT * FROM site_traffic_plz ORDER BY st_id DESC`;
        const loadTrafficLoop = await sql_con.promise().query(loadTrafficLoopQuery);
        allData = loadTrafficLoop[0];
    } catch (error) {

    }

    res.json({ status, allData, allCount })
})







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
    console.log('여기는 안들어오냐?!?!?!?');
    let status = true;
    const body = req.body;
    console.log(body);
    let memo_content = ""
    try {
        const getMemoContentQuery = `SELECT ${body.memoType} FROM site_traffic_loop WHERE st_id = ?`;
        console.log(getMemoContentQuery);
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
    console.log(body);
    console.log('일단 업데이트는 들어와?!?!');
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
        console.log('raised error?!?!?!');
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