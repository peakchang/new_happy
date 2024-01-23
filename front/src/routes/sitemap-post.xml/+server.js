import { sql_con } from '$lib/server/db'



export async function GET({ url }) {
    let sitemapContent = "";
    let data = [];
    try {
        const postListQuery = "SELECT bo_id, bo_created_at, bo_updated_at FROM board ORDER BY bo_id DESC";
        const postList = await sql_con.promise().query(postListQuery);
        data = postList[0];
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            const getTime = element.bo_updated_at ? element.bo_updated_at : element.bo_created_at;
            // const date = new Date(getTime);
            // const isoDateString = date.toISOString();
            const formattedDate = formatDateToCustomFormat(getTime)
            data[i]['lastmod'] = formattedDate
        }
    } catch (error) {

    }

    for (let l = 0; l < data.length; l++) {
        const element = data[l];
        const template = `
        <url>
            <loc>${url.origin}/view/${element.bo_id}</loc>
            <lastmod>${element.lastmod}</lastmod>
        </url>
        `
        sitemapContent = sitemapContent + template;
    }

    return new Response(
        `
        <?xml version="1.0" encoding="UTF-8" ?>
        <urlset
            xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        >

        ${sitemapContent}

        </urlset>`.trim(),
        {
            headers: {
                'Content-Type': 'application/xml'
            }
        }
    );
}


// function formatDateToISO8601(dateString: any) {
//     // 입력된 날짜 문자열을 Date 객체로 변환
//     const date = new Date(dateString);

//     // 날짜를 ISO 8601 형식으로 변환 (YYYY-MM-DDTHH:mm:ss+09:00)
//     const formattedDate = date.toISOString();

//     return formattedDate;
// }

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