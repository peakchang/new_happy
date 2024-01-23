import { back_api } from "$src/lib/const";

export const load = async ({ fetch, url }) => {
    
    let get_category;
    let siteName;
    let category_list = []
    try {
        const res = await fetch(`${back_api}/main`,);

        const data = await res.json();
        get_category = data.get_category
        siteName = data.get_category.cf_name

        const categoryName = get_category.cf_category.split(',');
        const categoryLink = get_category.cf_menu.split(',');

        for (let i = 0; i < categoryName.length; i++) {
            const tempCate = {
                link: categoryLink[i],
                name: categoryName[i]
            }
            category_list.push(tempCate);
        }

    } catch (error) {
        console.error(error.message);

    }


    return { category_list, siteName }

}