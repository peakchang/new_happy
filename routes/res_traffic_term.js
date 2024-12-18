import express from "express";
import { sql_con } from '../back-lib/db.js'
import bcrypt from "bcrypt";
import cheerio from "cheerio";
import moment from "moment";
const resTrafficTermRouter = express.Router();

resTrafficTermRouter.get('/get_delete_used_profile_list', async (req, res, next) => {

    let status = true;
    let used_profile_list = [];
    try {
        const getUsedProfileListQuery = "SELECT * FROM profile_list WHERE pl_work_status = TRUE";
        const [getUsedProfileList] = await sql_con.promise().query(getUsedProfileListQuery);
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
    const plId = req.body.pl_id

    try {

        // profile 테이블에 있는지 확인하고 넣기!!
        const chkProfileQuery = "SELECT * FROM profile WHERE pr_name =?";
        const [chkProfileRows] = await sql_con.promise().query(chkProfileQuery, [plId]);
        if (chkProfileRows.length == 0) {
            const addProfileQuery = "INSERT INTO profile (pr_name) VALUES (?)";
            await sql_con.promise().query(addProfileQuery, [plId]);
        }

        const lastTrafficChk = "SELECT * FROM last_traffic_chk WHERE lt_name = ?";
        const [lastTrafficRows] = await sql_con.promise().query(lastTrafficChk, [plId]);
        if (lastTrafficRows.length == 0) {
            const addLastTrafficQuery = "INSERT INTO last_traffic_chk (lt_name, lt_last_time) VALUES (?,?)";
            await sql_con.promise().query(addLastTrafficQuery, [plId, moment().format('YYYY-MM-DD HH:mm:ss')]);
        }

        // profile_list 에 없으면 100부터 / 있으면 다음거 / 800개가 넘으면 다시 100부터!
        const chkProfileListQuery = "SELECT * FROM profile_list";
        const [chkProfileListRows] = await sql_con.promise().query(chkProfileListQuery);
        const chkProfileList = chkProfileListRows
        console.log(chkProfileList);

        if (chkProfileList.length == 0) {
            const addProfileListQuery = "INSERT INTO profile_list (pl_name,pl_number) VALUES (?,?)";
            await sql_con.promise().query(addProfileListQuery, [plId, 100]);
            profile_number = 100;
        } else {
            const lastProfile = chkProfileList[chkProfileList.length - 1];
            console.log(lastProfile);
            profile_number = Number(lastProfile['pl_number']) + 1
            if (profile_number > 800) {
                profile_number = 100;
            }
            const addProfileListQuery = "INSERT INTO profile_list (pl_name,pl_number) VALUES (?,?)";
            await sql_con.promise().query(addProfileListQuery, [plId, profile_number]);
        }

    } catch (err) {
        console.error(err.message);

        status = false;
    }
    console.log('들어오니?!?!?!');



    res.json({ status, profile_number })
})



export { resTrafficTermRouter }