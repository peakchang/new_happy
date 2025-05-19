import express from "express";
import { sql_con } from '../back-lib/db.js'
import bcrypt from "bcrypt";
import cheerio from "cheerio";
const fbchkRouter = express.Router();


fbchkRouter.get('/', async (req, res, next) => {
    console.log('들어와!!!!');
    res.json({})
})

fbchkRouter.post('/', async (req, res, next) => {
    console.log('안들어옴?!?!?!');

    const body = req.body;
    const leadsId = body.leadsId;
    const formId = body.formId;

    const access_token = 'EAAJZAZCH0ZAUiYBOZBApyQHQlzwtUqZCgQRLyqfs3WJMY1ObOGf4qEgZA807sBZBTlS2MZCUqZAHlzVRZBCL5GCgXzmzxWSKdFzhRflm25v6vxSiAvykjHZAkicH1gpnKgB2T78pTaLmcxFZBRPLDBqnaiaeZC88G5A3NKON3P6ZB0wrZApvscZA2Yss9SZBZAd4CI'

    let leadsUrl = `https://graph.facebook.com/v18.0/${leadsId}?access_token=${access_token}`
    let formUrl = `https://graph.facebook.com/v18.0/${formId}?access_token=${access_token}`

    let getLeadsData = {}
    let getFormData = {}

    try {
        const leadsRes = await fetch(leadsUrl);
        getLeadsData = await leadsRes.json();

        const formRes = await fetch(formUrl);
        getFormData = await formRes.json();

        return res.json({ getLeadsData, getFormData })
    } catch (error) {
        return res.status(400).json({})
    }



})


export { fbchkRouter }