import axios from 'axios';
import cheerio from "cheerio";
import { back_api } from '$src/lib/const';



export const prerender = false;

export const load = async ({ params, url }) => {

    const { id } = params;
    let nextPosts = []
    let previousPosts = []
    let content;
    let get_reply;
    let seoValue = {
        title: "",
        description: "",
        keywords: "",
        url: url.href,
        image: "",
    };



    try {
        const res = await fetch(`${back_api}/main/detail`, {
            method: 'POST',
            body: JSON.stringify({ id }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await res.json();
        content = data.content;
        content['getContentText'] = content.bo_content;
        nextPosts = data.get_next_post
        previousPosts = data.get_previous_post

    } catch (error) {
        console.error(error.message);
    }


    const date = new Date(content.bo_created_at);

    const year = date.getFullYear().toString().slice(2); // '23'
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // '07'
    const day = date.getDate().toString().padStart(2, "0"); // '14'
    content["date_str"] = `${year}.${month}.${day}`;
    const $ = cheerio.load(content['getContentText']);
    const imageTag = $("img");
    seoValue["image"] = imageTag.length
        ? imageTag.eq(0).attr("src")
        : "/no-image.png";
    seoValue["title"] = content.bo_subject;
    seoValue["description"] = content.bo_description;
    seoValue["keywords"] = content.bo_keyword;

    const createdObject = new Date(content.bo_created_at);
    const createTimeStr = createdObject.toISOString();
    if (content.bo_updated_at) {
        const updatedObject = new Date(content.bo_updated_at);
        const updatedTimeStr = updatedObject.toISOString();
        seoValue["modified_time"] = updatedTimeStr;
    } else {
        seoValue["modified_time"] = createTimeStr;
    }
    seoValue["published_time"] = createTimeStr;





    try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL
            ? import.meta.env.VITE_SERVER_URL
            : url.origin
            }/api/v7/main/get_reply`, {
            method: 'POST',
            body: JSON.stringify({ id }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await res.json();

        get_reply = data.get_reply;

        for (let i = 0; i < get_reply.length; i++) {
            get_reply[i]["hidden_ip"] = hideLastTwoSegments(
                get_reply[i]["re_ip"]
            );
            get_reply[i]['date'] = formatDate(get_reply[i]['re_created_at']);
        }
    } catch (error) {
        console.error(error.message);
    }
    return { content, seoValue, get_reply, nextPosts, previousPosts }
}

function formatDate(date) {

    const dateParts = date.split("T")[0].split("-");

    // dateParts 배열에서 년, 월, 일을 추출합니다.
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
    const formattedDate = `${year} .${parseInt(month)} .${parseInt(day)}`;

    return formattedDate;
}

function hideLastTwoSegments(ipAddress) {
    const segments = ipAddress.split(".");
    if (segments.length < 4) {
        // 유효한 IP 주소가 아님
        return "Invalid IP address";
    }

    // 마지막 두 부분을 '*'로 대체
    segments[2] = "*";
    segments[3] = "*";

    return segments.join(".");
}