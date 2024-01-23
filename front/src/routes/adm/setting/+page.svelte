<script>
    import { admin_sidebar } from "$src/lib/store";
    import axios from "axios";
    import { Button } from "flowbite-svelte";
    import { back_api } from "$lib/const";

    export let data;
    let cf_name = data.get_config.cf_name;
    let cf_site = data.get_config.cf_site;

    let cf_category = data.get_config.cf_category;
    let cf_menu = data.get_config.cf_menu;
    let cf_pwd = "";

    async function configUpdate() {
        const configDataList = {
            cf_name,
            cf_site,
            cf_category,
            cf_menu,
            cf_pwd,
        };
        try {
            await axios
                .post(`${back_api}/adm/setting`, { configDataList })
                .then((res) => {
                    alert("수정이 완료 되었습니다.");
                    cf_pwd = "";
                });
        } catch (error) {
            console.error(error);
        }
    }
</script>

<div class="text-right mr-6">
    <Button class="py-1 bg-blue-500 hover:bg-blue-600" on:click={configUpdate}
        >수정</Button
    >
</div>

<div class="mt-4">
    <div class="mb-2">
        ※ 카테고리와 메뉴명은 (,)콤마로 구분되며, 카테고리는 메뉴명 / 영어는
        해당 주소 링크가 되므로 같은 숫자로 맞춰주세요
    </div>

    <table class="w-full border-collapse">
        <tr>
            <th class="border border-slate-300 p-1"> 사이트명 </th>
            <td class="border border-slate-300 p-1">
                <input
                    type="text"
                    class="py-1 w-full rounded-lg border-gray-400"
                    bind:value={cf_name}
                />
            </td>
        </tr>
        <tr>
            <th class="border border-slate-300 p-1"> 사이트주소 </th>
            <td class="border border-slate-300 p-1">
                <input
                    type="text"
                    class="py-1 w-full rounded-lg border-gray-400"
                    bind:value={cf_site}
                />
            </td>
        </tr>
        <tr>
            <th class="border border-slate-300 p-1"> 카테고리 </th>
            <td class="border border-slate-300 p-1">
                <input
                    type="text"
                    class="py-1 w-full rounded-lg border-gray-400"
                    bind:value={cf_category}
                />
            </td>
        </tr>
        <tr>
            <th class="border border-slate-300 p-1"> 메뉴명(영어) </th>
            <td class="border border-slate-300 p-1">
                <input
                    type="text"
                    class="py-1 w-full rounded-lg border-gray-400"
                    bind:value={cf_menu}
                />
            </td>
        </tr>
        <tr>
            <th class="border border-slate-300 p-1"> 비밀번호 </th>
            <td class="border border-slate-300 p-1">
                <input
                    type="text"
                    class="py-1 w-full rounded-lg border-gray-400"
                    bind:value={cf_pwd}
                />
            </td>
        </tr>
    </table>
</div>
