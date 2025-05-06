import express from "express";
import { sql_con } from '../back-lib/db.js'
import bcrypt from "bcrypt";
import cheerio from "cheerio";
import moment from "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

const resRouter = express.Router();


resRouter.get('/cron_test', (req, res) => {
    console.log('crontab GET 요청을 받았습니다.');
    res.send('GET 요청이 성공적으로 수행되었습니다.');
});

// 24-03-13 추가 내용!!!!!!!!!!!!!!!!

// 백링크 작업 리스트에 작업 사이트 추가
resRouter.use('/add_work_list_new', async (req, res, next) => {

    let status = true;
    const now = moment().format('YYYY-MM-DD HH:mm:ss')
    const getLink = `${req.query.now_link}?bo_table=${req.query.board_id}&wr_id=${req.query.wr_id}`
    try {
        const insertWorkQuery = "INSERT INTO backlink_works (bw_link, bw_target, bw_created_at) VALUES (?,?,?)";
        await sql_con.promise().query(insertWorkQuery, [getLink, req.query.writeLink, now]);
    } catch (error) {
        console.error(error.message);

        status = false
    }
    res.json({ status })
})


// 작업 시작할때 미리 백링크 사용으로 업데이트 하기!!!
resRouter.use('/backlink_update', async (req, res, next) => {
    let status = true;
    const updateLinkId = req.query.update_link;
    try {
        const updateLinkQuery = "UPDATE backlinks SET bl_work_bool = true WHERE bl_id = ?"
        await sql_con.promise().query(updateLinkQuery, [updateLinkId]);
    } catch (error) {
        status = false;
    }
    res.json({ status })
})

resRouter.use('/target_workout', async (req, res, next) => {
    let status = true;
    try {
        const targetResetUpdateQuery = "UPDATE target SET tg_workbool = true";
        await sql_con.promise().query(targetResetUpdateQuery);
    } catch (error) {
        status = false;
    }
    res.json({ status })
})



resRouter.use('/target_update', async (req, res, next) => {
    let status = true;
    const targetId = req.query.target_id;
    const targetCount = req.query.target_count;

    try {
        const updateTargetBoolQuery = "UPDATE target SET tg_workbool = FALSE, tg_workcount = ? WHERE tg_id = ?";
        await sql_con.promise().query(updateTargetBoolQuery, [targetCount, targetId]);
    } catch (error) {
        status = false;
    }
    res.json({ status })
})


// resRouter.use('/get_target_data', async (req, res, next) => {
//     let status = true;
//     let target_list = [];

//     try {
//         const allWorkListQuery = "SELECT * FROM target WHERE tg_workbool = TRUE";
//         const allWorkList = await sql_con.promise().query(allWorkListQuery);
//         const all_work_list = allWorkList[0];
//         target_list = all_work_list
//     } catch (error) {
//         status = false;
//     }

//     res.json({ status, target_list });
// })


resRouter.use('/join_success', async (req, res, next) => {
    let status = true;
    const b = req.body
    try {
        const updateRegistQuery = "UPDATE backlinks SET bl_siteid = ?, bl_sitepwd = ? WHERE bl_id = ?";
        await sql_con.promise().query(updateRegistQuery, ["ridebbuu", "1324qewr!", b.bl_id]);
    } catch (error) {

    }
    res.json({ status })
})

resRouter.use('/get_join_data', async (req, res, next) => {

    console.log('여기는?!?!');

    let status = true;
    let join_info = {}
    try {
        const getJoinInfoQuery = "SELECT * FROM backlinks WHERE bl_siteid IS NULL LIMIT 1";
        const [getJoinInfo] = await sql_con.promise().query(getJoinInfoQuery);
        if (getJoinInfo.length == 0) {
            status = "complete";
        } else {
            join_info = getJoinInfo[0];
        }
    } catch (error) {
        status = false;
    }
    res.json({ status, join_info })
})

resRouter.use('/get_target_data', async (req, res, next) => {
    let status = true;
    let target_list = [];

    try {
        const allWorkListQuery = "SELECT * FROM target WHERE tg_workbool = TRUE AND tg_used = FALSE";
        const [allWorkList] = await sql_con.promise().query(allWorkListQuery);
        // 리스트가 2개 미만이면 status 400 으로 리턴, 전체 true로 업데이트 하기!
        if (allWorkList.length < 2) {
            const updateAllTrueQuery = "UPDATE target SET tg_used = FALSE"
            await sql_con.promise().query(updateAllTrueQuery);
            status = false;
            return res.json({ status })
        }
        // 아니면 2개 뽑아서 tg_used TRUE로 업데이트!
        const randomTwo = [...allWorkList].sort(() => Math.random() - 0.5).slice(0, 2);
        for (let i = 0; i < randomTwo.length; i++) {
            const d = randomTwo[i];
            const updateQuery = "UPDATE target SET tg_used = TRUE WHERE tg_id = ?"
            await sql_con.promise().query(updateQuery, [d.tg_id]);
        }
        target_list = randomTwo

    } catch (error) {
        status = false;
    }

    return res.json({ status, target_list });
})


// 마지막 백링크 작업 시간 넣기
resRouter.post('/update_last_backlink_work', async (req, res, next) => {
    let status = true;
    const body = req.body;
    const now = moment().format('YYYY-MM-DD HH:mm:ss')

    try {
        const getIdInfoQuery = "SELECT * FROM backlink_last WHERE bl_pc_id = ?"
        const [getIdInfo] = await sql_con.promise().query(getIdInfoQuery, [body.pc_id]);

        if (getIdInfo.length == 0) {
            console.log('insert!!!!!!!!!!!!!!!!!');
            const insertQuery = "INSERT INTO backlink_last (bl_pc_id) VALUES (?)";
            await sql_con.promise().query(insertQuery, [body.pc_id]);
        } else {
            console.log('update!!!!!!!!!!!!!!!!!');
            const updateQuery = "UPDATE backlink_last SET bl_last_work_time = ? WHERE bl_pc_id = ?";
            await sql_con.promise().query(updateQuery, [now, body.pc_id]);
        }
    } catch (error) {
        status = false;
    }


    res.json({ status })
})

// 백링크 테스트 작업 얻기
resRouter.use('/get_backlink_test_data', async (req, res, next) => {
    
    let status = true;
    let get_work = {}

    try {
        const getTestWorkQuery = "SELECT * FROM backlinks WHERE bl_test = TRUE LIMIT 1";
        const [getTestWork] = await sql_con.promise().query(getTestWorkQuery);
        if (getTestWork.length == 0) {
            status = false;
        } else {
            get_work = getTestWork[0]
        }

    } catch (error) {

    }

    return res.json({ status, get_work })
})

// 백링크 작업 데이터 얻기
resRouter.use('/get_backlink_data', async (req, res, next) => {


    let status = true;
    let get_work = {}

    try {

        const getWorkLinkQuery = "SELECT * FROM backlinks WHERE bl_status = true AND bl_problem = false AND bl_work_bool = false AND bl_test = false AND bl_siteid IS NOT NULL";
        const [getWorkLink] = await sql_con.promise().query(getWorkLinkQuery);

        if (getWorkLink.length == 0) {
            const resetWorkLinkQuery = "UPDATE backlinks SET bl_work_bool = false"
            await sql_con.promise().query(resetWorkLinkQuery);
            status = false;
            return res.json({ status })
        }

        const randomOne = [...getWorkLink].sort(() => Math.random() - 0.5).slice(0, 1);

        get_work = randomOne[0]
        const updateOneQuery = "UPDATE backlinks SET bl_work_bool = TRUE WHERE bl_id = ?";
        await sql_con.promise().query(updateOneQuery, [get_work.bl_id]);


    } catch (error) {
        console.error(error.message);

    }

    return res.json({ status, get_work })
})

// 문제 항목 리셋하기
resRouter.use('/reset_problem', async (req, res, next) => {
    let status = true;
    try {
        const resetProblemQuery = "UPDATE backlinks SET bl_problem = FALSE";
        await sql_con.promise().query(resetProblemQuery);
    } catch (error) {
        status = false;
    }
    res.json({ status })
})





// 여긴 어디지??

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
    let status = true;
    const currentTime = moment().format('YYYY/MM/DD');
    const body = req.body
    const statValue = body.value
    const nowMemo = `${currentTime} ${body.message}`

    if (statValue == "false") {
        try {
            const updateFaultyQuery = "UPDATE backlinks SET bl_status = FALSE, bl_memo = ? WHERE bl_id = ?";
            await sql_con.promise().query(updateFaultyQuery, [nowMemo, body.bl_id]);
        } catch (error) {
            status = false
        }
    } else if (statValue == "problem") {
        try {
            const updateFaultyQuery = "UPDATE backlinks SET bl_problem = TRUE, bl_memo = ? WHERE bl_id = ?";
            await sql_con.promise().query(updateFaultyQuery, [nowMemo, body.bl_id]);
        } catch (error) {
            status = false
        }
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