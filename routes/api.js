import express from "express";
import { sql_con } from '../back-lib/db.js'
import bcrypt from "bcrypt";
import cheerio from "cheerio";
import axios from 'axios'
import moment from "moment-timezone";
import aligoapi from "aligoapi"

const apiRouter = express.Router();


apiRouter.get('/blog_aligo', async (req, res, next) => {

    console.log('일단 들어오닝?!');

    let status = false;
    const url = 'https://apis.aligo.in/send/';
    const now = moment().format('M/D h:mm');

    var AuthData = {
        key: 'jt7j3tl1dopaogmoauhoc68wrry0wswc',
        // 이곳에 발급받으신 api key를 입력하세요
        user_id: 'adpeaka',
        // 이곳에 userid를 입력하세요
    }

    req.body = {
        sender: '010-3124-1105',  // (최대 16bytes)
        receiver: '010-2190-2197', // 컴마()분기 입력으로 최대 1천명
        msg: `${now} 작업완료!`,	// (1~2,000Byte)
        msg_type: 'SMS',
    }

    try {
        const result = await aligoapi.send(req, AuthData);
        status = true
    } catch (error) {
        console.error('문자 전송 오류:', error);
    }









    // try {
    //     const response = await axios.post(url, {
    //         key: 'jt7j3tl1dopaogmoauhoc68wrry0wswc',         // 예: 'abc123xyz456'
    //         user_id: 'adpeaka',        // 예: 'testuser'
    //         sender: '010-3124-1105',              // 예: '01012345678' (사전 등록 필요)
    //         receiver: '010-2190-2197',                   // 예: '01098765432'
    //         msg: `${now} 작업완료!`,                       // 보낼 문자
    //         msg_type: 'SMS',                // 또는 'LMS'
    //     });
    //     status = true
    //     console.log('결과:', response.data);
    // } catch (error) {
    //     console.log('에러가 났어요~');


    //     console.error('에러 발생:', error.response ? error.response.data : error.message);
    // }

    res.json({ status })
})

apiRouter.get('/testppp', async (req, res, next) => {
    let status = true;
    res.json({ status: true })
})

apiRouter.post('/', async (req, res, next) => {
    const body = req.body;
    let validPassword;
    try {
        const getPwdQuery = "SELECT cf_pwd FROM config WHERE cf_base='base';";
        const getPwd = await sql_con.promise().query(getPwdQuery);
        const get_pwd = getPwd[0][0];
        validPassword = await bcrypt.compare(body.pwdVal, get_pwd.cf_pwd);

    } catch (error) {
        console.error(error.message);
        validPassword = false;

    }
    res.json({ validPassword })
})

apiRouter.post('/add_post_list', async (req, res, next) => {
    const body = req.body;
    let listStatus = true;
    const getPostListQuery = "SELECT * FROM board ORDER BY bo_id DESC LIMIT ?, 10";
    const getPostList = await sql_con.promise().query(getPostListQuery, [body.postNum]);
    const posts = getPostList[0];

    for (let i = 0; i < posts.length; i++) {
        const date = new Date(posts[i].bo_created_at);
        const year = date.getFullYear().toString().slice(2); // '23'
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // '07'
        const day = date.getDate().toString().padStart(2, "0"); // '14'
        posts[i]["date_str"] = `${year}.${month}.${day}`;


        const $ = cheerio.load(posts[i]["bo_content"]);
        const imageTag = $("img");
        posts[i]["img_link"] = imageTag.length
            ? imageTag.eq(0).attr("src")
            : "/no-image.png";
        posts[i]["text"] = $("p").text();
    }


    if (posts.length < 10) {
        listStatus = false;
    }

    res.json({ posts, listStatus })
})



export { apiRouter }