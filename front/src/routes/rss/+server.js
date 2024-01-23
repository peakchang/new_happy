import { sql_con } from '$lib/server/db'



export async function GET({ url }) {

    let get_board_list = []
    let rssItemStr = ""
    try {
        const getBoardQuery = "SELECT * FROM board;"
        const getBoardList = await sql_con.promise().query(getBoardQuery, ['base']);
        get_board_list = getBoardList[0]
    } catch (error) {

    }
    for (let i = 0; i < get_board_list.length; i++) {
        const data = get_board_list[i];
        const getTime = data.bo_updated_at ? data.bo_updated_at : data.bo_created_at;
        // const date = new Date(getTime);
        // const isoDateString = date.toISOString();
        const formattedDate = formatDateToCustomFormat(getTime)
        get_board_list[i]['pubdate'] = formattedDate

        const template = `
        <item>
        <title>${data.bo_subject}</title>
        <link>${url.origin}/view/${data.bo_id}</link>
        <description>${data.bo_description ? data.bo_description : ""}</description>
        <pubDate>${data.pubdate}</pubDate>
        </item>
        `
        rssItemStr = rssItemStr + template
    }
    
    return new Response(
        `
        <?xml version="1.0" encoding="UTF-8" ?>
        <rss version="2.0">
        <channel>

        <title>행복 가득 두꺼비</title>
        <link>${url.origin}/rss</link>
        <description>건강,연예,맛집,분양 등 다양한 정보를 전하는 두꺼비 블로그</description>
        <language>ko</language>
        <copyright>Copyright(C) 행복 가득 두꺼비 rights reserved.</copyright>
        <pubDate>2023.06.26</pubDate>

        ${rssItemStr}


        </channel>
        </rss>`.trim(),
        {
            headers: {
                'Content-Type': 'application/xml'
            }
        }
    );
}



function formatDateToCustomFormat(dateString) {
    // 입력된 날짜 문자열을 Date 객체로 변환
    const date = new Date(dateString);

    // 날짜를 원하는 형식으로 포맷
    const formattedDate = `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}T${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}+09:00`;

    return formattedDate;
}

function padZero(value) {
    // 한 자리 숫자인 경우 앞에 0을 붙여 두 자리로 만듦
    return String(value).padStart(2, '0');
}