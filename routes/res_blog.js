import express from "express";
import { sql_con } from '../back-lib/db.js'
import bcrypt from "bcrypt";
import cheerio from "cheerio";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const resBlogRouter = express.Router();

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
    let idx_list = [];
    try {
        const getFiftyIdxQuery = "SELECT n_idx, n_id, n_blog_order, n_link_use FROM nwork WHERE n_use = TRUE AND n_blog_order >= ? ORDER BY n_blog_order IS NULL, n_blog_order ASC LIMIT 0,70;"
        const [getFiftyIdx] = await sql_con.promise().query(getFiftyIdxQuery, [getStartOrderNum]);
        idx_list = getFiftyIdx
    } catch (error) {
        status = false;
    }

    res.json({ idx_list, status })
})


// 카페 작업을 할시, 카운트를 하나씩 올려 작업 안한 카페가 우선순위로 오게 한다!
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
    const linkStatus = req.query.link_status
    const nowStr = moment().format('YYYY-MM-DD');
    const updateMemo = `${nowStr} 작업 완료`
    let addQuery = '';
    if (linkStatus === 'True') {
        addQuery = ', n_link_use = TRUE'
    }
    try {
        const updateMemeQuery = `UPDATE nwork SET n_memo2 = ?${addQuery} WHERE n_idx = ?`
        await sql_con.promise().query(updateMemeQuery, [updateMemo, getProfile]);
    } catch (error) {
        status = false;
    }
    res.json({ status })
})



export { resBlogRouter }