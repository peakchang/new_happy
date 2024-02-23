import express from "express";
import { sql_con } from '../back-lib/db.js'
import bcrypt from "bcrypt";
import cheerio from "cheerio";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const resRouter = express.Router();


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