import express from "express";
import moment from "moment-timezone";
import bcrypt from "bcrypt";
import { sql_con } from '../back-lib/db.js'

const admRouter = express.Router();



// 프로필 작업!!!!

admRouter.post('/load_profile_list', async (req, res, next) => {
    let status = true;
    let profile_list = [];
    const body = req.body;
    const getId = body.getId;
    let addQuery = "";
    if (getId) {
        addQuery = `WHERE pl_name = '${getId}'`
    }
    try {
        const getProfileListQuery = `SELECT * FROM profile_list ${addQuery} ORDER BY pl_id DESC`
        console.log(getProfileListQuery);
        const getProfileList = await sql_con.promise().query(getProfileListQuery);
        profile_list = getProfileList[0]
    } catch (error) {

    }

    res.json({ status, profile_list })
})

admRouter.post('/upload_profile_list', async (req, res, next) => {
    let status = true;
    const body = req.body;
    let exceptList = [];
    const profileArr = body.profileArr
    for (let i = 0; i < profileArr.length; i++) {
        const data = profileArr[i];
        try {
            const insertProfileQuery = "INSERT INTO profile_list (pl_name, pl_number) VALUES (?,?)";
            await sql_con.promise().query(insertProfileQuery, [body.chkId, data]);
        } catch (error) {
            exceptList.push(data)
        }
    }

    console.log(exceptList);
    res.json({ status, exceptList })
})



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


// 여기는 첫번째 검색 키워드 처리하는곳!!!
admRouter.get('/keyword_load', async (req, res, next) => {
    let status = true;
    let allData = [];
    try {
        const loadPreKeywordQuery = `SELECT * FROM pre_keyword ORDER BY pk_id DESC`
        const loadPreKeyword = await sql_con.promise().query(loadPreKeywordQuery);
        allData = loadPreKeyword[0]
    } catch (error) {
        status = false;
    }

    res.json({ status, allData })
})


admRouter.post('/keyword_upload', async (req, res, next) => {
    const body = req.body;
    let status = true;

    try {
        const insertPreKeywordQuery = `INSERT INTO pre_keyword (pk_content) VALUES (?)`;
        await sql_con.promise().query(insertPreKeywordQuery, [body.preKeywordInsertValue]);
    } catch (error) {
        status = false;
    }
    res.json({ status })
})

admRouter.post('/keyword_update', async (req, res, next) => {
    let status = true;
    const body = req.body;
    const updateList = req.body.updateList;
    try {

        for (let i = 0; i < updateList.length; i++) {
            const updateQuery = "UPDATE pre_keyword SET pk_content = ?, pk_use = ?, pk_group = ? WHERE pk_id = ?";
            await sql_con.promise().query(updateQuery, [updateList[i]['pk_content'], updateList[i]['pk_use'], updateList[i]['pk_group'], updateList[i]['pk_id']]);
        }

    } catch (error) {
        status = false;
    }

    res.json({ status })
})



admRouter.post('/keyword_delete', async (req, res, next) => {
    let status = true;
    const deleteList = req.body.deleteList;

    console.log(deleteList);
    try {
        for (let i = 0; i < deleteList.length; i++) {
            const deleteQuery = "DELETE FROM pre_keyword WHERE pk_id = ?";
            await sql_con.promise().query(deleteQuery, [deleteList[i]]);
        }

    } catch (error) {
        status = false;
    }

    res.json({ status })
})

export { admRouter }