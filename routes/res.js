import express from "express";
import { sql_con } from '../back-lib/db.js'
import bcrypt from "bcrypt";
import cheerio from "cheerio";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const resRouter = express.Router();




// 24-03-13 추가 내용!!!!!!!!!!!!!!!!




resRouter.use('/target_workout', async (req, res, next) => {
    let status = true;

    const updateLinkId = req.query.update_link;

    try {
        const updateLinkQuery = "UPDATE backlinks SET bl_work_bool = true WHERE bl_id = ?"
        await sql_con.promise().query(updateLinkQuery, [updateLinkId]);

        const targetResetUpdateQuery = "UPDATE target SET tg_workbool = true";
        await sql_con.promise().query(targetResetUpdateQuery);
    } catch (error) {
        status = false;
    }

    res.json({ status })
})



resRouter.use('/success_target_update', async (req, res, next) => {
    let status = true;
    const targetId = req.query.target_id;
    const targetCount = req.query.target_count;

    console.log(targetId);
    console.log(targetCount);
    try {
        const updateTargetBoolQuery = "UPDATE target SET tg_workbool = FALSE, tg_workcount = ? WHERE tg_id = ?";
        await sql_con.promise().query(updateTargetBoolQuery, [targetCount, targetId]);
    } catch (error) {
        status = false;
    }
    res.json({ status })
})


resRouter.use('/get_target_data', async (req, res, next) => {
    let status = true;
    let target_list = [];

    try {
        const allWorkListQuery = "SELECT * FROM target WHERE tg_workbool = TRUE";
        const allWorkList = await sql_con.promise().query(allWorkListQuery);
        const all_work_list = allWorkList[0];
        target_list = all_work_list
    } catch (error) {
        status = false;
    }

    res.json({ status, target_list });
})

// 백링크 작업 데이터 얻기
resRouter.use('/get_backlink_data', async (req, res, next) => {

    let status = true;
    let get_work = []


    try {
        const getWorkLinkQuery = "SELECT * FROM backlinks WHERE bl_status = true AND bl_work_bool = false"
        const getWorkLink = await sql_con.promise().query(getWorkLinkQuery);
        get_work = getWorkLink[0];
        console.log(get_work);
        if (get_work.length == 0) {
            const resetWorkLinkQuery = "UPDATE backlinks SET bl_work_bool = false"
            await sql_con.promise().query(resetWorkLinkQuery);
            status = false;
            return res.json({ status })
        }
    } catch (error) {

    }

    return res.json({ status, get_work })
})

resRouter.use('/add_news_work', async (req, res, next) => {
    let status = true;
    const newsLink = req.query.addnewslink;

    try {
        const insertNewsLinkQuery = `INSERT INTO used_news (un_content) VALUES (?)`;
        await sql_con.promise().query(insertNewsLinkQuery, [newsLink]);

        const countNewsLinkQuery = "SELECT count(*) FROM used_news";
        const countNewsLink = await sql_con.promise().query(countNewsLinkQuery);

        if (countNewsLink[0][0]['count(*)'] > 10) {
            const deleteFirstLinkQuery = "DELETE FROM used_news un_content LIMIT 1;";
            await sql_con.promise().query(deleteFirstLinkQuery);
        }
    } catch (err) {
        console.error(err.message);
    }
    res.json({ status })
})


resRouter.use('/get_news_list', async (req, res, next) => {
    let status = true;
    let news_list = []
    try {
        const getNewsListQuery = "SELECT * FROM used_news"
        const getNewsList = await sql_con.promise().query(getNewsListQuery);
        news_list = getNewsList[0]
    } catch (error) {
        status = false;
    }
    res.json({ status, news_list })
})


// ****************************************************************








// 새로 만들기 귀찮으니 비번 변경작업 여기 추가!!!!!
resRouter.use('/get_change_info', async (req, res, next) => {
    let status = true;
    const getIdx = req.query.nidx

    let id_info = ""
    try {
        const getIdInfoQuery = "SELECT * FROM nwork WHERE n_idx = ?";
        const getIdInfo = await sql_con.promise().query(getIdInfoQuery, [getIdx]);
        id_info = getIdInfo[0][0];
    } catch (error) {

    }

    console.log(getIdx);
    res.json({ status, id_info })
})


// 백링크 작업 사이트 추가
resRouter.use('/add_work_list', async (req, res, next) => {
    let status = true;
    const now = moment().format('YYYY-MM-DD HH:mm:ss')
    const getLink = `${req.query.now_link}?bo_table=${req.query.board_id}&wr_id=${req.query.wr_id}`
    const updateTargetId = req.query.worked_target_id
    const updateTargetCount = req.query.target_count
    const nowBacklinkRow = req.query.now_row
    try {
        const insertWorkQuery = "INSERT INTO backlink_works (bw_link, bw_created_at) VALUES (?,?)";
        await sql_con.promise().query(insertWorkQuery, [getLink, now]);

        const updateTargetCountQuery = "UPDATE target SET tg_workcount = ? WHERE tg_id =?"
        await sql_con.promise().query(updateTargetCountQuery, [updateTargetCount, updateTargetId]);

        const updateBacklinkStatusQuery = "UPDATE backlinks SET bl_work_bool = true WHERE bl_id = ?"
        await sql_con.promise().query(updateBacklinkStatusQuery, [nowBacklinkRow]);
    } catch (error) {
        status = false
    }
    res.json({ status })
})

// 백링크 작업 중 오류나는 사이트 체크
resRouter.use('/update_faulty_site', async (req, res, next) => {
    let status = 'success';
    console.log('앙뇽하세요');
    const currentTime = moment().format('YYYY/MM/DD');
    const nowNum = req.query.now_row
    const nowMemo = `${currentTime} ${req.query.now_memo}`
    try {
        const updateFaultyQuery = "UPDATE backlinks SET bl_status = false, bl_memo = ? WHERE bl_id = ?";
        await sql_con.promise().query(updateFaultyQuery, [nowMemo, nowNum]);
    } catch (error) {
        console.log(error.message);
        status = 'fail'
    }
    res.json({ status })
})

// 백링크 작업 데이터 얻기
resRouter.use('/get_data', async (req, res, next) => {

    let status = true;
    let get_work = []
    let work_list = [];


    try {
        const getWorkLinkQuery = "SELECT * FROM backlinks WHERE bl_status = true AND bl_work_bool = false"
        const getWorkLink = await sql_con.promise().query(getWorkLinkQuery);
        get_work = getWorkLink[0];
        console.log(get_work);
        if (get_work.length == 0) {
            const resetWorkLinkQuery = "UPDATE backlinks SET bl_work_bool = false"
            await sql_con.promise().query(resetWorkLinkQuery);
            status = false;
            return res.json({ status })
        }
    } catch (error) {

    }


    try {
        const allWorkListQuery = "SELECT * FROM target";
        const allWorkList = await sql_con.promise().query(allWorkListQuery);
        const all_work_list = allWorkList[0];
        work_list = all_work_list

    } catch (error) {

    }

    // console.log(get_work);
    return res.json({ status, work_list, get_work })
})




function shuffleArray(arr) {
    // 배열의 길이가 10 이하인 경우, 배열을 그대로 반환
    if (arr.length <= 10) {
        return arr;
    }

    // 10에서 13 사이의 랜덤한 개수를 선택
    const numToSelect = Math.floor(Math.random() * 4) + 10;

    // 배열을 복제하여 원본 배열을 변경하지 않도록 함
    const clonedArr = [...arr];

    // 배열을 랜덤하게 섞음
    for (let i = clonedArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [clonedArr[i], clonedArr[j]] = [clonedArr[j], clonedArr[i]];
    }

    // 선택된 개수만큼 요소를 잘라냄
    const selectedArr = clonedArr.slice(0, numToSelect);

    return selectedArr;
}


export { resRouter }