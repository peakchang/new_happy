import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
const app = express();


dotenv.config();
import { handler } from "./front/build/handler.js"
import { editorRouter } from "./routes/editor.js"
import { apiRouter } from "./routes/api.js"
import { admRouter } from "./routes/adm.js"
import { boardRouter } from "./routes/board.js"
import { mainRouter } from "./routes/main.js"


import { resRouter } from './routes/res.js';
import { resCafeRouter } from './routes/res_cafe.js';

import { resCafeServerRouter } from './routes/res_cafe_server.js';


import { resTrafficRouter } from './routes/res_traffic.js';
import { resTrafficLoopRouter } from './routes/res_traffic_loop.js';
import { resBlogRouter } from './routes/res_blog.js';

import { resTrafficTermRouter } from './routes/res_traffic_term.js';


import { admBackLinkRouter } from './routes/adm_backlink.js'
import { nworkRouter } from './routes/adm_nwork.js';
import { admCafeRouter } from './routes/adm_cafe.js';
import { admTrafficRouter } from './routes/adm_traffic.js';

import { fbchkRouter } from './routes/fbchk.js';




// import { apiRouter } from "./routes/exapi.js"
app.set('port', process.env.PORT || 3020);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// ESM 오류 해결을 위해 __dirname, __filename 직접 변수 작성
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname);

app.use(express.static('public', { ignore: ['favicon.ico'] }));
app.use('/editor', express.static(path.join(__dirname, 'public/uploads/editor')));
app.use('/image', express.static(path.join(__dirname, 'public/uploads/image')));

let corsOptions = {}
if (process.env.NODE_ENV === 'development') {
    corsOptions = {
        origin: '*',
        credentials: true
    }
} else {
    corsOptions = {
        origin: ['https://happy-toad1.shop', 'https://adpeak.kr'],  // 1번 도메인만 허용
        credentials: true,  // 인증 정보 포함 (쿠키, 세션 등)
        methods: ['GET', 'POST', 'PUT', 'DELETE'],  // 허용할 HTTP 메서드
        allowedHeaders: ['Content-Type', 'Authorization'],  // 허용할 헤더
    }
}

app.use(cors(corsOptions));

app.enable('trust proxy');

app.use('/api/v7/adm_backlink', admBackLinkRouter);
app.use('/api/v7/nwork', nworkRouter);
app.use('/api/v7/cafe_work', admCafeRouter);
app.use('/api/v7/traffic_work', admTrafficRouter);




app.use('/api/v7/res_traffic', resTrafficRouter);
app.use('/api/v7/res_traffic_loop', resTrafficLoopRouter);
app.use('/api/v7/res_traffic_term', resTrafficTermRouter);

app.use('/api/v7/res_cafe', resCafeRouter);

app.use('/api/v7/res_cafe_server', resCafeServerRouter);



app.use('/api/v7/res', resRouter);
app.use('/api/v7/res_blog', resBlogRouter);


app.use('/api/v7/adm', admRouter);
app.use('/api/v7/board', boardRouter);
app.use('/api/v7/editor', editorRouter);
app.use('/api/v7/main', mainRouter);
app.use('/api/v7', apiRouter);

app.use('/api/v7/fbchk', fbchkRouter);


app.use('/chk', (req, res) => {
    res.send('백엔드 생성 완료!!')
});

app.use(handler);


app.listen(app.get('port'), () => {
    console.log(`server running in port ${app.get('port')}`);
})