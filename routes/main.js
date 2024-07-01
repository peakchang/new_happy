import express from "express";
import { sql_con } from '../back-lib/db.js'
import { mailSender } from '../back-lib/lib.js'
const mainRouter = express.Router();

mainRouter.get('/chk_out_of_work_program', async (req, res, next) => {
    let status = true;

    let overTimeList = [];
    let overTimeListStr = ""

    try {
        // 10분이 지난 리스트 뽑기
        const getOverTimeListQuery = "SELECT * FROM last_traffic_chk WHERE lt_last_time < DATE_SUB(DATE_ADD(NOW(), INTERVAL 9 HOUR), INTERVAL 10 MINUTE);"
        const getOverTimeList = await sql_con.promise().query(getOverTimeListQuery);
        overTimeList = getOverTimeList[0];
        if (overTimeList.length > 0) {
            for (let i = 0; i < overTimeList.length; i++) {
                overTimeListStr = overTimeListStr + overTimeList[i]['lt_name'] + ' '
            }
            const sendStr = `현재 작동하지 않는 프로그램은
            ${overTimeListStr}
            입니다.
            `
            mailSender.sendEmail('changyong112@naver.com', '작동되지 않는 트래픽 프로그램이 있습니다.', sendStr)
        }
        
    } catch (error) {
        console.error(error.message);
        status = false;
    }

    res.json({ status })
})

mainRouter.post('/get_modify', async (req, res, next) => {
    const id = req.body.id;
    let get_content
    let get_category
    try {
        const getContentQuery = "SELECT * FROM board WHERE bo_id = ?";
        const getContent = await sql_con.promise().query(getContentQuery, [id]);
        get_content = getContent[0][0];
        const getCategoryQuery = "SELECT cf_category FROM config WHERE cf_base = 'base'";
        const getCategory = await sql_con.promise().query(getCategoryQuery);
        get_category = getCategory[0][0];
    } catch (error) {
        console.error(error.message);
    }

    res.json({ get_content, get_category })
})

mainRouter.post('/get_reply', async (req, res, next) => {
    let get_reply
    const id = req.body.id
    try {
        const getReplyQuery = "SELECT * FROM reply WHERE re_parent = ? ORDER BY re_id DESC"
        const getReply = await sql_con.promise().query(getReplyQuery, [id]);
        get_reply = getReply[0];
    } catch (error) {
        console.error(error.message);
    }
    res.json({ get_reply })
})

mainRouter.post('/detail', async (req, res, next) => {
    let content;
    const id = req.body.id
    let get_previous_post = []
    let get_next_post = []
    try {
        const getContentQuery = "SELECT * FROM board WHERE bo_id = ?";
        const getContent = await sql_con.promise().query(getContentQuery, [id]);
        content = getContent[0][0];
        const getPreviousPostQuery = "SELECT bo_id,bo_subject FROM board WHERE bo_category = ? AND bo_id < ? ORDER BY bo_id DESC LIMIT 1";
        const getPreviousPost = await sql_con.promise().query(getPreviousPostQuery, [content.bo_category, id]);
        get_previous_post = getPreviousPost[0]

        const getNextPostQuery = "SELECT bo_id,bo_subject FROM board WHERE bo_category = ? AND bo_id > ? ORDER BY bo_id ASC LIMIT 1"
        const getNextPost = await sql_con.promise().query(getNextPostQuery, [content.bo_category, id]);
        get_next_post = getNextPost[0]
    } catch (error) {
        console.error(error.message);
    }
    res.json({ content, get_previous_post, get_next_post })
})

mainRouter.post('/menu', async (req, res, next) => {
    let get_category;
    let posts;
    const cateLink = req.body.link
    let cateName
    try {
        const getCatogoryQuery = "SELECT cf_category,cf_menu FROM config WHERE cf_base = ?";
        const getCatogory = await sql_con.promise().query(getCatogoryQuery, ['base']);
        get_category = getCatogory[0][0];

        const cateCfMenu = get_category.cf_menu.split(',')
        const cateCfCate = get_category.cf_category.split(',')
        for (let i = 0; i < cateCfMenu.length; i++) {
            if (cateCfMenu[i] === cateLink) {
                cateName = cateCfCate[i]
                break
            }
        }
        const getCategoryContentQuery = "SELECT * FROM board WHERE bo_category = ?"
        const getCategoryContent = await sql_con.promise().query(getCategoryContentQuery, [cateName]);
        posts = getCategoryContent[0]

    } catch (error) {
        console.error(error.message);

    }
    res.json({ posts })
})

mainRouter.get('/base', async (req, res, next) => {

    let get_post_list;

    try {

        const getPostListQuery = "SELECT * FROM board ORDER BY bo_id DESC LIMIT 10";
        const getPostList = await sql_con.promise().query(getPostListQuery);
        get_post_list = getPostList[0]

    } catch (error) {
        console.error(error.message);
    }

    res.json({ get_post_list })
})

mainRouter.get('/', async (req, res, next) => {
    let get_category

    try {
        const getCatogoryQuery = "SELECT * FROM config WHERE cf_base = ?";
        const getCatogory = await sql_con.promise().query(getCatogoryQuery, ['base']);
        get_category = getCatogory[0][0];

    } catch (error) {
        console.error(error.message);
    }

    res.json({ get_category })
})






export { mainRouter }