import express from "express";
import moment from "moment-timezone";
import bcrypt from "bcrypt";
import { sql_con } from '../back-lib/db.js'

const admRouter = express.Router();

admRouter.get('/setting', async (req, res, next) => {
    let get_config
    try {
        const getConfigQuery = "SELECT * FROM config WHERE cf_base = 'base'";
        const getConfig = await sql_con.promise().query(getConfigQuery);
        get_config = getConfig[0][0];
    } catch (error) {

    }

    res.json({ get_config })
})


admRouter.post('/setting', async (req, res, next) => {
    const body = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        if (body.configDataList.cf_pwd) {
            const hashed = await bcrypt.hash(body.configDataList.cf_pwd, salt);
            const cfUpdateQuery = "UPDATE config SET cf_name=?,cf_site=?, cf_category=?, cf_menu=?, cf_pwd=? WHERE cf_base=?";
            await sql_con.promise().query(cfUpdateQuery, [body.configDataList.cf_name, body.configDataList.cf_site, body.configDataList.cf_category, body.configDataList.cf_menu, hashed, 'base']);
        } else {
            const cfUpdateQuery = "UPDATE config SET cf_name=?,cf_site=?, cf_category=?, cf_menu=? WHERE cf_base=?";
            await sql_con.promise().query(cfUpdateQuery, [body.configDataList.cf_name, body.configDataList.cf_site, body.configDataList.cf_category, body.configDataList.cf_menu, 'base']);
        }

    } catch (error) {
        // console.error(error);
    }
    res.json({ status: 'success' })
})



// 여기부터는 UserAgent 처리 하는곳!!

admRouter.post('/ua_update', async (req, res, next) => {
    let status = true;
    const body = req.body;
    const updateList = req.body.updateList;
    try {

        for (let i = 0; i < updateList.length; i++) {
            const updateQuery = "UPDATE user_agent SET ua_content = ?, ua_use = ? WHERE ua_id = ?";
            await sql_con.promise().query(updateQuery, [updateList[i]['ua_content'], updateList[i]['ua_use'], updateList[i]['ua_id']]);
        }

    } catch (error) {
        status = false;
    }

    res.json({ status })
})

admRouter.post('/ua_delete', async (req, res, next) => {
    let status = true;
    const deleteList = req.body.deleteList;
    try {
        for (let i = 0; i < deleteList.length; i++) {
            const deleteQuery = "DELETE FROM user_agent WHERE ua_id = ?";
            await sql_con.promise().query(deleteQuery, [deleteList[i]]);
        }

    } catch (error) {
        status = false;
    }

    res.json({ status })
})

admRouter.post('/ua_upload', async (req, res, next) => {
    const body = req.body;

    try {
        const insertUserAgentQuery = `INSERT INTO user_agent (ua_content) VALUES (?)`;
        await sql_con.promise().query(insertUserAgentQuery, [body.userAgentInsertValue]);
    } catch (error) {
        status = false;
    }
    let status = true;

    res.json({ status })
})

admRouter.get('/ua_load', async (req, res, next) => {
    let status = true;
    let allData = [];
    try {
        const loadUserAgentQuery = `SELECT * FROM user_agent ORDER BY ua_id DESC`
        const loadUserAgent = await sql_con.promise().query(loadUserAgentQuery);
        allData = loadUserAgent[0]
    } catch (error) {
        status = false;
    }

    res.json({ status, allData })
})


export { admRouter }