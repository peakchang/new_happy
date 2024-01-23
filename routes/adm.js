import express from "express";
import moment from "moment-timezone";
import bcrypt from "bcrypt";
import { sql_con } from '../back-lib/db.js'

const admRouter = express.Router();

admRouter.get('/setting', async (req, res, next) => {
    let get_config
    try {
        const getConfigQuery = "SELECT * FROM config WHERE cf_base = 'base'";
        const getConfig = await sql_con.promise().query(getConfigQuery);
        get_config = getConfig[0][0];
    } catch (error) {

    }

    res.json({ get_config })
})


admRouter.post('/setting', async (req, res, next) => {
    const body = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        if (body.configDataList.cf_pwd) {
            const hashed = await bcrypt.hash(body.configDataList.cf_pwd, salt);
            const cfUpdateQuery = "UPDATE config SET cf_name=?,cf_site=?, cf_category=?, cf_menu=?, cf_pwd=? WHERE cf_base=?";
            await sql_con.promise().query(cfUpdateQuery, [body.configDataList.cf_name, body.configDataList.cf_site, body.configDataList.cf_category, body.configDataList.cf_menu, hashed, 'base']);
        } else {
            const cfUpdateQuery = "UPDATE config SET cf_name=?,cf_site=?, cf_category=?, cf_menu=? WHERE cf_base=?";
            await sql_con.promise().query(cfUpdateQuery, [body.configDataList.cf_name, body.configDataList.cf_site, body.configDataList.cf_category, body.configDataList.cf_menu, 'base']);
        }

    } catch (error) {
        // console.error(error);
    }
    res.json({ status: 'success' })
})



export { admRouter }