import express from "express";
import { sql_con } from '../back-lib/db.js'
import bcrypt from "bcrypt";
import cheerio from "cheerio";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const resBlogRouter = express.Router();


resBlogRouter.post('/get_link_list', async (req, res, next) => {
    console.log('일단 들어옴??');
    const ran_work_list = []
    let status = true;
    let linkChkCount = 0

    const linkCount = Number(req.body.link_count);
    try {
        const getBlogLinkListQuery = "SELECT * FROM target WHERE tg_blog_work_bool = TRUE AND tg_blog_used = FALSE";
        const [getBlogLinkList] = await sql_con.promise().query(getBlogLinkListQuery);
        console.log(getBlogLinkList);
        if (getBlogLinkList.length < linkCount) {
            const blogLinkUpdateQuery = "UPDATE target SET tg_blog_used = FALSE";
            await sql_con.promise().query(blogLinkUpdateQuery);
            return res.json({ status: false })
        }
        while (ran_work_list.length <= linkCount) {
            linkChkCount++
            if(linkChkCount > 20){
                break
            }
            const randomIndex = Math.floor(Math.random() * getBlogLinkList.length);
            const randomValue = getBlogLinkList[randomIndex];
            if (!ran_work_list.includes(randomValue)) { // 중복 방지
                ran_work_list.push(randomValue);
            }
        }
        console.log(ran_work_list);
        for (let i = 0; i < ran_work_list.length; i++) {
            try {
                const updateUseVal = ran_work_list[i];
                const updateQuery = "UPDATE target SET tg_blog_used = TRUE WHERE tg_id =?";
                await sql_con.promise().query(updateQuery, [updateUseVal['tg_id']]);
            } catch (error) {
                console.error(error.message);
            }
        }
    } catch (error) {
        console.error(error.message);
    }
    return res.json({ status, ran_work_list })
})



resBlogRouter.get('/get_random_useragent', async (req, res, next) => {
    console.log('들어오니?!?!?!');
    let status = true;
    let ua_info = {}

    try {
        const getAllUserAgentQuery = "SELECT * FROM user_agent";
        const [getAllUserAgent] = await sql_con.promise().query(getAllUserAgentQuery);
        console.log(getAllUserAgent);

        const ua_count = getAllUserAgent.length;
        console.log(ua_count);

        const uaNum = Math.floor(Math.random() * ua_count) + 1;
        ua_info = getAllUserAgent[uaNum];
        console.log(ua_info);

    } catch (error) {
        console.error(error.message);
    }


    res.json({ status, ua_info })
})

resBlogRouter.post('/id_error_chk', async (req, res, next) => {
    console.log('들어오니?!?!?!');
    let status = true;
    const body = req.body;
    const nowDate = moment().format('YYYY-MM-DD')
    try {
        const memoUpdateQuery = "UPDATE nwork SET n_memo2 = ? WHERE n_idx = ?";
        await sql_con.promise().query(memoUpdateQuery, [`${nowDate} 보호조치 XX`, body.n_idx]);
    } catch (error) {
        status = false;
    }
    res.json({ status })
})

resBlogRouter.post('/update_chk_blog', async (req, res, next) => {
    let status = true;
    const body = req.body;
    const searchStatus = body.search_status
    const nId = body.n_id;
    const getMemo = body.n_memo2
    console.log(searchStatus);

    let updateStr = ""
    if (searchStatus == 'True' && getMemo.includes('XX')) {
        updateStr = getMemo.replace('XX', 'OK')
    } else if (searchStatus == 'True') {
        updateStr = getMemo + ' OK'
    } else if (searchStatus == 'False' && getMemo.includes('XX')) {
        updateStr = getMemo
    } else if (searchStatus == 'False') {
        updateStr = getMemo + ' XX'
    }

    console.log(updateStr);


    try {
        const updateIdInfoQuery = "UPDATE nwork SET n_memo2 = ? WHERE n_id = ?";
        await sql_con.promise().query(updateIdInfoQuery, [updateStr, nId]);
    } catch (err) {
        console.error(err.message);

        status = false;
    }

    res.json({ status })

})

resBlogRouter.post('/get_chk_blog_id_info', async (req, res, next) => {

    const startVal = req.body.start_val;
    let status = true;
    let id_info = {}
    try {
        const getIdInfoQuery = "SELECT * FROM nwork WHERE n_use = TRUE AND n_blog_order >= ? ORDER BY n_blog_order IS NULL, n_blog_order ASC LIMIT 0,1;"
        const [getIdInfo] = await sql_con.promise().query(getIdInfoQuery, [startVal]);
        id_info = getIdInfo[0]

    } catch (error) {
        status = false;
    }

    res.json({ status, id_info })

})

// 아이디값 50개 얻어오기!!!
resBlogRouter.post('/get_idx_list', async (req, res, next) => {
    console.log('일단 들어오는지 보자규!!');

    let status = true;
    let getStartOrderNum = req.body.start_val;
    let countVal = req.body.count_val
    let idx_list = [];
    try {
        const getFiftyIdxQuery = `SELECT n_idx, n_id, n_blog_order, n_link_use FROM nwork WHERE n_use = TRUE AND n_blog_order >= ? ORDER BY n_blog_order IS NULL, n_blog_order ASC LIMIT 0,${countVal};`

        console.log(getFiftyIdxQuery);

        const [getFiftyIdx] = await sql_con.promise().query(getFiftyIdxQuery, [getStartOrderNum]);
        idx_list = getFiftyIdx
    } catch (error) {
        console.error(error.message);
        status = false;
    }

    res.json({ idx_list, status })
})


// 블로그 모바일 버전 아이디 구하기
resBlogRouter.use('/get_blog_id_info_m', async (req, res, next) => {
    console.log('일단 들어옴!!');

    let status = true;
    const getProfile = req.query.get_profile;
    let blog_info = ""
    let uaNum = 0;
    let ua_info = {};
    try {
        const getBlogInfoQuery = `SELECT * FROM nwork WHERE n_idx = ?`;
        const [getBlogInfo] = await sql_con.promise().query(getBlogInfoQuery, [getProfile]);
        blog_info = getBlogInfo[0]
        uaNum = blog_info.n_ua
        if (!uaNum) {
            // ua 테이블 길이 구하기!
            const getCountUaQuery = "SELECT COUNT(*) as ua_count FROM user_agent;";
            const [getCountUa] = await sql_con.promise().query(getCountUaQuery);
            const ua_count = getCountUa[0].ua_count;
            console.log(ua_count);

            uaNum = Math.floor(Math.random() * ua_count) + 1;
            const updateUaQuery = "UPDATE nwork SET n_ua =? WHERE n_idx =?";
            await sql_con.promise().query(updateUaQuery, [uaNum, getProfile]);
        }
        const getUaInfoQuery = `SELECT * FROM user_agent LIMIT ${uaNum - 1}, 1`;
        const [getUaInfo] = await sql_con.promise().query(getUaInfoQuery, [uaNum]);
        ua_info = getUaInfo[0];
    } catch (error) {
        status = false;
    }
    res.json({ status, blog_info, ua_info })
})

// 블로그 모바일 버전 아이디 프로필로 구하기

resBlogRouter.use('/get_blog_id_info_m_profile', async (req, res, next) => {
    console.log('일단 들어옴!!');

    let status = true;
    const getProfile = req.query.get_profile;
    let chk_blog_info = {}
    try {
        const getBlogInfoQuery = "SELECT * FROM nwork WHERE n_blog_order = ?";
        const [getBlogInfo] = await sql_con.promise().query(getBlogInfoQuery, [getProfile]);
        chk_blog_info = getBlogInfo[0]
    } catch (error) {
        status = false;
    }
    res.json({ status, chk_blog_info })
})

// 블로그 아이디 구하기
resBlogRouter.use('/get_blog_id_info', async (req, res, next) => {
    let status = true;
    const getProfile = req.query.get_profile;
    let blog_info = ""

    try {
        const getBlogInfoQuery = `SELECT * FROM nwork WHERE n_idx = ?`;
        const getBlogInfo = await sql_con.promise().query(getBlogInfoQuery, [getProfile]);
        blog_info = getBlogInfo[0][0]
    } catch (error) {
        status = false;
    }
    res.json({ status, blog_info })
})

// 카페 작업을 할시, 카운트를 하나씩 올려 작업 안한 카페가 우선순위로 오게 한다!
resBlogRouter.use('/memo_update', async (req, res, next) => {

    let status = true;
    const getProfile = req.query.get_nidx;
    const linkStatus = req.query.link_status;
    const blog_id = req.query.blog_id;


    const nowStr = moment().format('YYYY-MM-DD');
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    let updateMemo = `${nowStr} 작업 완료`
    let addQuery = '';
    let memoQuery = '';
    if (linkStatus === 'True') {
        addQuery = ', n_link_use = TRUE'
    }
    try {
        const getBlogIdInfoQuery = "SELECT n_memo1 FROM nwork WHERE n_idx = ?";
        const [getBlogIdInfo] = await sql_con.promise().query(getBlogIdInfoQuery, [getProfile]);
        console.log(getBlogIdInfo);

        if (getBlogIdInfo[0].n_memo1 == null) {
            memoQuery = `, n_memo1 = '${blog_id}'`
        } else if (!getBlogIdInfo[0].n_memo1.includes(blog_id)) {
            memoQuery = `, n_memo1 = '${blog_id} / ${getBlogIdInfo[0].n_memo1}'`
        }
        const updateMemeQuery = `UPDATE nwork SET n_lastwork_at = ? ${memoQuery}, n_memo2 = ?${addQuery} WHERE n_idx = ?`

        await sql_con.promise().query(updateMemeQuery, [now, updateMemo, getProfile]);
    } catch (error) {
        console.error(error.message);

        status = false;
    }
    res.json({ status })
})



export { resBlogRouter }