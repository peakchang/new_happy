import express from "express";
import { sql_con } from '../back-lib/db.js'
import bcrypt from "bcrypt";
import cheerio from "cheerio";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const resBlogRouter = express.Router();

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
    const getProfile = req.query.get_profile;
    const nowStr = moment().format('YYYY-MM-DD');
    const updateMemo = `${nowStr} 작업 완료`
    try {
        const updateMemeQuery = "UPDATE nwork SET n_memo2 = ? WHERE n_blog_any = TRUE AND n_idx = ?"
        await sql_con.promise().query(updateMemeQuery, [updateMemo, getProfile]);
    } catch (error) {
        status = false;
    }
    res.json({ status })
})



export { resBlogRouter }