<script>
    import { Checkbox, Img, Toggle } from "flowbite-svelte";
    import { goto, invalidateAll } from "$app/navigation";
    import axios from "axios";
    import { back_api } from "$src/lib/const";

    let formArea;
    let userAgentInsertValue = "";
    let chkedList = [];
    let allChecked = false;
    let allData = [];

    export let data;
    $: data, setData();

    function setData() {
        allData = data.allData;
        console.log(allData);
    }

    async function uaFormAct(e) {
        e.preventDefault();
        const action = e.submitter.value;

        if (action == "upload") {
            // ★ 업로드!! 새로 올릴때!!!!!!!!!!!!!!
            if (!userAgentInsertValue) {
                alert("UsertAgent 값이 입력되지 않았습니다.");
                return false;
            }

            try {
                const res = await axios.post(`${back_api}/adm/ua_upload`, {
                    userAgentInsertValue,
                });
                if (res.data.status) {
                    alert("업로드가 완료 되었습니다.");
                    invalidateAll();
                    userAgentInsertValue = "";
                }
            } catch (error) {}
        } else if (action == "update") {
            // ★ 업데이트를 하는 부분이니까 업데이트!!!!!!!!!!!!!
            let updateList = chkedList.map((index) => allData[index]);
            try {
                const res = await axios.post(`${back_api}/adm/ua_update`, {
                    updateList,
                });
                if (res.data.status) {
                    invalidateAll();
                    chkedList = [];
                    allChecked = false;
                    alert('업데이트가 완료 되었습니다.')
                }
            } catch (error) {}
        } else if (action == "delete") {
            if (chkedList.length == 0) {
                alert("지울 항목을 선택해주세요");
                return false;
            }

            if (
                !confirm("삭제된 항목은 복구가 불가합니다. 삭제하시겠습니까?")
            ) {
                return false;
            }
            let deleteList = chkedList.map((index) => allData[index]["ua_id"]);
            try {
                const res = await axios.post(`${back_api}/adm/ua_delete`, {
                    deleteList,
                });
                if (res.data.status) {
                    invalidateAll();
                    chkedList = [];
                    allChecked = false;
                    alert('삭제가 완료 되었습니다.')
                }
            } catch (error) {}
        }
    }
</script>

<form on:submit={uaFormAct} bind:this={formArea}>
    <div class="flex gap-2">
        <input
            type="text"
            class="px-2 p-0.5 rounded-sm text-sm"
            bind:value={userAgentInsertValue}
        />
        <button
            value="upload"
            class="px-5 rounded-md bg-blue-500 active:bg-blue-600 text-white"
        >
            행 추가
        </button>
        <button
            value="update"
            class="px-5 rounded-md bg-green-500 active:bg-green-600 text-white"
        >
            업데이트
        </button>
        <button
            value="delete"
            class="px-5 rounded-md bg-red-500 active:bg-red-600 text-white"
        >
            행 삭제
        </button>
    </div>
</form>

<div class="w-full min-w-[800px] overflow-auto mt-5">
    <div class="w-full max-w-[1200px]">
        <table class="w-full text-center">
            <tr>
                <th class="border py-2 w-[70px]">
                    <div class="flex justify-center pl-2">
                        <Checkbox value="allchk" bind:checked={allChecked} />
                    </div>
                </th>
                <th class="border py-2 w-[100px]"> 사용 </th>
                <th class="border py-2"> User Agent </th>
            </tr>

            {#each allData as data, idx}
                <tr>
                    <td class="border">
                        <div class="flex justify-center pl-2">
                            <Checkbox value={idx} bind:group={chkedList} />
                        </div>
                    </td>
                    <td class="border py-2">
                        <div class="flex justify-center pl-2">
                            <Toggle
                                size="small"
                                bind:checked={allData[idx]["ua_use"]}
                            />
                        </div>
                    </td>
                    <td class="border p-1.5">
                        <input
                            type="text"
                            class="w-full border-gray-200 rounded-md text-sm"
                            bind:value={allData[idx]["ua_content"]}
                        />
                    </td>
                </tr>
            {/each}
        </table>
    </div>
</div>
