import { category_list } from "$src/lib/const";
import { sql_con } from '$lib/server/db'



export async function GET({ url }) {

    let category_list = [];
    let sitemapContentBase = ""
    let sitemapContentPost = "";
    let data = [];


    try {
        const getCatogoryQuery = "SELECT * FROM config WHERE cf_base = ?";
        const getCatogory = await sql_con.promise().query(getCatogoryQuery, ['base']);
        const get_category = getCatogory[0][0];
        const categoryName = get_category.cf_category.split(',');
        const categoryLink = get_category.cf_menu.split(',');

        for (let i = 0; i < categoryName.length; i++) {
            const tempCate = {
                link: categoryLink[i],
                name: categoryName[i]
            }
            category_list.push(tempCate);
        }


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

    for (let i = 0; i < category_list.length; i++) {
        const element = category_list[i];
        const template = `
        <url>
            <loc>${url.origin}/menu/${element.link}</loc>
            <changefreq>always</changefreq>
            <priority>0.8</priority>
        </url>
        `
        sitemapContentBase = sitemapContentBase + template;
    }

    for (let l = 0; l < data.length; l++) {
        const element = data[l];
        const template = `
        <url>
            <loc>${url.origin}/view/${element.bo_id}</loc>
            <lastmod>${element.lastmod}</lastmod>
        </url>
        `
        sitemapContentPost = sitemapContentPost + template;
    }

    // sitemapindex는 사이트맵이 여러 페이지일 경우 쓰임
    // urlset은 바로 URL을 보여주고 싶을때 쓰임 (직접 or 하위)

    return new Response(
        `
        <?xml version="1.0" encoding="UTF-8" ?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
            <loc>${url.origin}</loc>
            <changefreq>always</changefreq>
            <priority>1.0</priority>
        </url>

        ${sitemapContentBase}

        ${sitemapContentPost}

        </urlset>`.trim(),
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