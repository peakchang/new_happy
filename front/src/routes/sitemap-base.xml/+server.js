
import { sql_con } from '$lib/server/db'

export async function GET({ url }) {

    const getCatogoryQuery = "SELECT * FROM config WHERE cf_base = ?";
    const getCatogory = await sql_con.promise().query(getCatogoryQuery, ['base']);
    const get_category = getCatogory[0][0];
    const categoryName = get_category.cf_category.split(',');
    const categoryLink = get_category.cf_menu.split(',');
    const category_list = [];

    for (let i = 0; i < categoryName.length; i++) {
        const tempCate = {
            link: categoryLink[i],
            name: categoryName[i]
        }
        category_list.push(tempCate);
    }


    let sitemapContent = `
    <url>
        <loc>${url.origin}</loc>
        <changefreq>always</changefreq>
        <priority>1.00</priority>
    </url>
    `
    for (let i = 0; i < category_list.length; i++) {
        const element = category_list[i];
        const template = `
        <url>
            <loc>${url.origin}/menu/${element.link}</loc>
            <changefreq>always</changefreq>
            <priority>1.00</priority>
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