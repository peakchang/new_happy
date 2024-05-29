import express from "express";
import { sql_con } from '../back-lib/db.js'
import fs from 'fs'
const boardRouter = express.Router();
import moment from "moment-timezone";
import { log } from "console";
moment.tz.setDefault("Asia/Seoul");

boardRouter.post('/modify_api_img', async (req, res, next) => {
    let status = 'success';
    let get_content

    try {
        const getId = req.body.getId;
        const getContentQuery = "SELECT * FROM board WHERE bo_id = ?";
        const getContent = await sql_con.promise().query(getContentQuery, [getId]);
        get_content = getContent[0][0];


        const chkContent = get_content.bo_content.includes('https://happy-toad.xyz')

        if (chkContent) {
            const setContent = replaceDomains(get_content.bo_content);
            const setContentQuery = "UPDATE board SET bo_content = ? WHERE bo_id = ?";
            await sql_con.promise().query(setContentQuery, [setContent, getId]);
        }
    } catch (error) {
        console.error(error.message);
    }

    res.json({ status })
})

function replaceDomains(inputString) {
    // 대체할 문자열 설정
    var replacement = "https://api.happy-toad.xyz";

    // 정규식 패턴 설정
    var pattern = /https:\/\/happy-toad\.xyz/g;

    // 문자열 내에서 정규식 패턴과 일치하는 모든 대상 문자열을 대체 문자열로 변경
    var modifiedString = inputString.replace(pattern, replacement);

    return modifiedString;
}

boardRouter.post('/reply_regist', async (req, res, next) => {

    try {
        const body = req.body;
        const randomIP = generateRandomIP();
        const now = moment().format('YYYY-MM-DD HH:mm:ss');
        const bodyArr = [body.getId, randomIP, body.convertTag, now]
        const insertReplyQuery = "INSERT INTO reply (re_type, re_parent, re_ip,re_content, re_created_at) VALUES ('write', ?,?,?,?)"
        await sql_con.promise().query(insertReplyQuery, bodyArr);
    } catch (error) {
        console.error(error.message);
    }

    res.status(200).json({ status: 'success' })
})

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomIP() {
    const ipComponents = [];
    for (let i = 0; i < 4; i++) {
        const component = getRandomInt(0, 255);
        ipComponents.push(component);
    }
    return ipComponents.join('.');
}








boardRouter.post('/delete', async (req, res, next) => {
    const data = req.body;

    let delImgList = data.contentArr
    try {
        const deletePostQuery = "DELETE FROM board WHERE bo_id = ?";
        await sql_con.promise().query(deletePostQuery, [data.getId]);
    } catch (error) {
        console.error(error.message);
    }

    for (let i = 0; i < delImgList.length; i++) {
        if (delImgList[i]) {
            try {
                fs.unlinkSync(delImgList[i]);
            } catch (error) {
                console.error(error.message);
            }
        }
    }
    res.json({ status: 'success' });
})


boardRouter.post('/modify', async (req, res, next) => {
    let status = 'success';
    const body = req.body;

    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const now = moment().format('YYYY-MM-DD HH:mm:ss');

    try {
        const updateContentQuery = "UPDATE board SET bo_category=?, bo_subject=?, bo_content=?,bo_keyword=?,bo_description=?, bo_updated_at=? WHERE bo_id=?";
        await sql_con.promise().query(updateContentQuery, [body.category, body.subject, body.content, body.keyword, body.description, now, body.getId]);
    } catch (error) {
        console.error(error.message);
        status = 'fail';
    }

    const delImgList = body.contentArr
    for (let i = 0; i < delImgList.length; i++) {
        if (delImgList[i]) {
            try {
                fs.unlinkSync(delImgList[i]);
            } catch (error) {
                console.error(error.message);
            }
        }
    }

    res.json({ status })
})

boardRouter.get('/write', async (req, res, next) => {
    let get_category
    try {
        const getCategoryQuery = "SELECT cf_category FROM config WHERE cf_base = 'base'";
        const getCategory = await sql_con.promise().query(getCategoryQuery);
        get_category = getCategory[0][0];
    } catch (error) {
    }
    res.json({ get_category })
})

boardRouter.post('/write', async (req, res, next) => {
    let status = 'success';
    const body = req.body
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const now = moment().format('YYYY-MM-DD HH:mm:ss');

    try {
        const registContentQuery = "INSERT INTO board (bo_category, bo_subject, bo_content, bo_keyword, bo_description, bo_created_at) VALUES (?,?,?,?,?,?)";
        await sql_con.promise().query(registContentQuery, [body.category, body.subject, body.content, body.keyword, body.description, now]);
    } catch (error) {
        console.error(error.message);
        status = 'fail';
    }

    const imgList = body.contentArr
    for (let i = 0; i < imgList.length; i++) {
        if (imgList[i]) {
            try {
                fs.unlinkSync(imgList[i]);
            } catch (error) {
                console.error(error);

            }
        }

    }
    res.json({ status })
})




export { boardRouter }