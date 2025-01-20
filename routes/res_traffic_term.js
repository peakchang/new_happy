import express from "express";
import { sql_con } from '../back-lib/db.js'
import bcrypt from "bcrypt";
import cheerio from "cheerio";
import moment from "moment";
const resTrafficTermRouter = express.Router();


// 트래픽 작업 부분!!!

resTrafficTermRouter.post('/get_profile', async (req, res, next) => {


    let status = true;
    let get_profile = {}
    let get_group = 0;
    const pl_id = req.body.pl_id;

    const now = moment();
    const currentHour = now.hour();

    let startDate = ""
    if (currentHour >= 0 && currentHour < 6) {
        startDate = moment().subtract(5, 'days').format('YYYY-MM-DD');
    } else {
        startDate = moment().subtract(4, 'days').format('YYYY-MM-DD');
    }

    try {

        const getProfileGroupQuery = "SELECT pr_group FROM profile WHERE pr_name = ?";
        const [getProfileGroup] = await sql_con.promise().query(getProfileGroupQuery, [pl_id]);
        get_group = getProfileGroup[0].pr_group;
        const getProfileQuery = `SELECT * FROM profile_list WHERE pl_name = ? AND pl_work_status = FALSE AND pl_lastworked_at BETWEEN '${startDate} 00:00:00' AND '${startDate} 23:59:59' LIMIT 1`;
        console.log(getProfileQuery);

        const [getProfile] = await sql_con.promise().query(getProfileQuery, [pl_id]);
        if (getProfile.length === 0) {
            status = false;
        } else {
            get_profile = getProfile[0];
            console.log(get_profile);
            const updateProfileListQuery = "UPDATE profile_list SET pl_work_status = TRUE WHERE pl_id = ?"
            await sql_con.promise().query(updateProfileListQuery, [get_profile.pl_id]);
        }
    } catch (error) {
        console.error(error.message);

        status = false;
    }

    res.json({ status, get_profile, get_group })
})


// 프로필 삭제 및 생성 하는 부분!!!

resTrafficTermRouter.get('/get_delete_used_profile_list', async (req, res, next) => {
    console.log('delete used profile list');

    let status = true;
    let used_profile_list = [];
    const getPcId = req.query.pc_id;
    try {
        const getUsedProfileListQuery = "SELECT * FROM profile_list WHERE pl_work_status = TRUE AND pl_name = ?";
        const [getUsedProfileList] = await sql_con.promise().query(getUsedProfileListQuery, [getPcId]);
        console.log(getUsedProfileList);
        used_profile_list = getUsedProfileList;

        for (let i = 0; i < getUsedProfileList.length; i++) {
            const ele = getUsedProfileList[i];
            try {
                const deleteProfileQuery = "DELETE FROM profile_list WHERE pl_id = ?";
                await sql_con.promise().query(deleteProfileQuery, [ele.pl_id]);
            } catch (error) {

            }
        }
    } catch (error) {
        status = false;
    }
    res.json({ status, used_profile_list })
})

// 한바퀴 다 돌면 프로필 체크에 갯수 더하는 부분!!!
resTrafficTermRouter.get('/update_profile_count', async (req, res, next) => {
    let status = true;
    const query = req.query
    console.log(query);


    try {
        // 사용한 프로필 조회 후 작업 횟수 더해주기!!
        const getProfileWorkCountQuery = "SELECT pl_work_count,pl_name FROM profile_list WHERE pl_number = ?";
        const getProfileWorkCount = await sql_con.promise().query(getProfileWorkCountQuery, [query['pl_number']]);
        console.log(getProfileWorkCount);

        const profile_work_count = getProfileWorkCount[0][0]['pl_work_count'];
        const profile_name = getProfileWorkCount[0][0]['pl_name'];

        console.log(`얻은 프로필 카운트는?? ${profile_work_count}`);
        console.log(`업데이트 할 프로필 카운트는?? ${profile_work_count}`);
        console.log(profile_name);

        const updateProfileWorkCountQuery = "UPDATE profile_list SET pl_work_count =? WHERE pl_number =?"
        await sql_con.promise().query(updateProfileWorkCountQuery, [profile_work_count + 1, query['pl_number']]);

        // 마지막 트래픽 작업 부분에도 현재 시간 추가
        const now = moment().format('YYYY-MM-DD HH:mm:ss');
        const updateLastTrafficTimeChkQuery = "UPDATE last_traffic_chk SET lt_last_time = ? WHERE lt_name = ? ";
        await sql_con.promise().query(updateLastTrafficTimeChkQuery, [now, profile_name]);

    } catch (error) {
        console.error(error.message);
        status = false;
    }

    res.json({ status });
})

// 프로필 체크 후 새로운 프로필 생성하는 부분!!
resTrafficTermRouter.post('/profile_chk_or_add', async (req, res, next) => {
    let status = true;
    let profile_number = 0;
    let today_count = 0;
    const plId = req.body.pl_id
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    const today = moment().format('YYYY-MM-DD');

    console.log(plId);


    try {
        // 오늘 날짜 00시 에서 23시59분 사이 만들어진 프로필 갯수 구하기
        const chkCountTodayMadeProfileQuery = `SELECT COUNT(*) AS today_count FROM profile_list WHERE pl_name = ? AND pl_lastworked_at BETWEEN '${today} 00:00:00' AND '${today} 23:59:59';`
        const [chkCountTodayMadeProfile] = await sql_con.promise().query(chkCountTodayMadeProfileQuery, [plId]);
        today_count = chkCountTodayMadeProfile[0].today_count;

        // profile 테이블에 컴터 아이디값 있는지 확인하고 넣기!!
        const chkProfileQuery = "SELECT * FROM profile WHERE pr_name =?";
        const [chkProfileRows] = await sql_con.promise().query(chkProfileQuery, [plId]);
        if (chkProfileRows.length == 0) {
            const addProfileQuery = "INSERT INTO profile (pr_name) VALUES (?)";
            await sql_con.promise().query(addProfileQuery, [plId]);
        }

        // last_traffic 테이블에 있는지 확인하고 넣기!!
        const lastTrafficChk = "SELECT * FROM last_traffic_chk WHERE lt_name = ?";
        const [lastTrafficRows] = await sql_con.promise().query(lastTrafficChk, [plId]);
        if (lastTrafficRows.length == 0) {
            const addLastTrafficQuery = "INSERT INTO last_traffic_chk (lt_name, lt_last_time) VALUES (?,?)";
            await sql_con.promise().query(addLastTrafficQuery, [plId, moment().format('YYYY-MM-DD HH:mm:ss')]);
        }

        // profile_list 에 없으면 100부터 / 있으면 다음거 / 800개가 넘으면 다시 100부터!
        const chkProfileListQuery = "SELECT * FROM profile_list WHERE pl_name = ? ORDER BY pl_id DESC";
        const [chkProfileListRows] = await sql_con.promise().query(chkProfileListQuery, [plId]);
        const chkProfileList = chkProfileListRows
        // console.log(chkProfileList);

        if (chkProfileList.length == 0) {
            const addProfileListQuery = "INSERT INTO profile_list (pl_name,pl_number,pl_lastworked_at) VALUES (?,?,?)";
            console.log(addProfileListQuery);

            await sql_con.promise().query(addProfileListQuery, [plId, 100, now]);
            profile_number = 100;
        } else {

            const chkLastProfileQuery = "SELECT * FROM profile_list WHERE pl_name = ? ORDER BY pl_id DESC LIMIT 0,1";
            const [chkLastProfile] = await sql_con.promise().query(chkLastProfileQuery, [plId]);
            const lastProfile = chkLastProfile[0]
            console.log(lastProfile);
            profile_number = Number(lastProfile['pl_number']) + 1
            if (profile_number >= 800) {
                profile_number = 100;
            }
            const addProfileListQuery = "INSERT INTO profile_list (pl_name,pl_number,pl_lastworked_at) VALUES (?,?,?)";
            console.log(addProfileListQuery);

            await sql_con.promise().query(addProfileListQuery, [plId, profile_number, now]);
        }

    } catch (err) {
        console.error(err.message);
        status = false;
    }
    console.log('들어오니?!?!?!');
    res.json({ status, profile_number, today_count })
})



export { resTrafficTermRouter }