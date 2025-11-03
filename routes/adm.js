import express from "express";
import moment from "moment-timezone";
import bcrypt from "bcrypt";
import { sql_con } from '../back-lib/db.js'

const admRouter = express.Router();

// 여러 키워드 업로드
admRouter.post('/many_keywords_uploads', async (req, res) => {
    let faild_count = 0;
    const body = req.body;
    const keywordArr = body.mayny_keywords_arr
    for (let i = 0; i < keywordArr.length; i++) {
        const element = keywordArr[i];
        try {
            const insertKeywordQuery = "INSERT INTO pre_keyword (pk_content) VALUES (?)";
            await sql_con.promise().query(insertKeywordQuery, [element]);
        } catch (error) {
            faild_count = faild_count + 1;
        }
    }

    res.json({ faild_count })
})

// 프로필 작업!!!!

admRouter.post('/load_profile_list', async (req, res, next) => {
    let status = true;
    let profile_list = [];
    let profiles = [];
    const body = req.body;
    console.log(body);

    const getId = body.getId;
    let addQuery = "";
    if (getId && getId != 'all') {
        addQuery = `WHERE pl_name = '${getId}'`
    }
    if (body.start_date && body.end_date) {
        if (addQuery) {
            addQuery = `${addQuery} AND pl_lastworked_at  BETWEEN '${body.start_date} 00:00:00' AND '${body.end_date} 23:59:59'`
        } else {
            addQuery = `WHERE pl_lastworked_at  BETWEEN '${body.start_date} 00:00:00' AND '${body.end_date} 23:59:59'`
        }
    }
    try {
        const getProfilesQuery = `SELECT * FROM profile`;
        const getProfiles = await sql_con.promise().query(getProfilesQuery);
        profiles = getProfiles[0]
        const getProfileListQuery = `SELECT * FROM profile_list ${addQuery} ORDER BY pl_id DESC`
        const getProfileList = await sql_con.promise().query(getProfileListQuery);
        profile_list = getProfileList[0]
    } catch (error) {

    }

    res.json({ status, profile_list, profiles })
})

admRouter.post('/upload_profile_list', async (req, res, next) => {
    let status = true;
    const body = req.body;
    let exceptList = [];
    const profileArr = body.profileArr


    try {
        const insertProfileNameQuery = "INSERT INTO profile (pr_name) VALUES (?)";
        await sql_con.promise().query(insertProfileNameQuery, [body.chkId]);
    } catch (error) {

    }


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
    const data = body.configDataList
    console.log(data);
    
    try {
        const salt = await bcrypt.genSalt(10);
        if (body.configDataList.cf_pwd) {
            const hashed = await bcrypt.hash(data.cf_pwd, salt);
            const cfUpdateQuery = "UPDATE config SET cf_name=?, cf_webclass=?,cf_site=?, cf_category=?, cf_menu=?, cf_pwd=? WHERE cf_base=?";
            await sql_con.promise().query(cfUpdateQuery, [data.cf_name, data.cf_webclass, data.cf_site, data.cf_category, data.cf_menu, hashed, 'base']);
        } else {
            const cfUpdateQuery = "UPDATE config SET cf_name=?, cf_webclass=?,cf_site=?, cf_category=?, cf_menu=? WHERE cf_base=?";
            await sql_con.promise().query(cfUpdateQuery, [data.cf_name, data.cf_webclass, data.cf_site, data.cf_category, data.cf_menu, 'base']);
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