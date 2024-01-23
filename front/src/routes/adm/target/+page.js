import { back_api } from "$src/lib/const";

export const load = async ({ fetch, url }) => {

    let targetList = []
    try {
        const res = await fetch(`${back_api}/adm_backlink/target_get_list`);
        const data = await res.json();
        targetList = data.target_list

    } catch (error) {
        console.error(error.message);

    }
    return { targetList }

}