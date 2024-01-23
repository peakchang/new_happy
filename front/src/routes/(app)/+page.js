import cheerio from "cheerio";
import { back_api } from "$src/lib/const";


export const load = async ({ fetch, url }) => {

    let posts = []

    try {
        const res = await fetch(`${back_api}/main/base`,);
        const data = await res.json();
        posts = data.get_post_list

    } catch (error) {
        console.error(error.message);
    }

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
    return { posts }
}