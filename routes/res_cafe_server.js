import express from "express";
import { sql_con } from '../back-lib/db.js'
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const resCafeServerRouter = express.Router();
// 글 작성시 카페 아이디 얻기
resCafeServerRouter.use('/get_cafework', async (req, res, next) => {
    let status = true;
    let workStatus = true;

    try {
        const getLatestWorkInfoQuery = "SELECT * FROM cafe_ready ORDER BY cr_work_date DESC LIMIT 1";
        const [getLatestWorkInfo] = await sql_con.promise().query(getLatestWorkInfoQuery);
        console.log(getLatestWorkInfo[0]);

        // 최근 1개 정보 불러옴! 아이디 불러오는데 UA값 없으면 업데이트!! 하고 다시 불러오기!!

    } catch (error) {

    }
    res.json({})
})


export { resCafeServerRouter }