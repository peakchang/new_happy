<script>
    import moment from "moment-timezone";
    moment.tz.setDefault("Asia/Seoul");
    import { back_api } from "$src/lib/const";
    import axios from "axios";
    import { invalidateAll } from "$app/navigation";

    let cafeWorkList = [];
    let startDate = moment().subtract(3, "days").format("YYYY-MM-DD");
    let endDate = moment().format("YYYY-MM-DD");
    let chkedList = [];
    let allChkcked = false;
    export let data;

    $: data, setData();
    function setData() {
        cafeWorkList = data.cafe_work_list;
    }

    function searchDate() {
        console.log("lasidjfliasjdf");
    }

    async function deleteCafeWorkListFunc() {
        console.log(chkedList);
        console.log(cafeWorkList);
        let deleteList = [];
        for (let i = 0; i < chkedList.length; i++) {
            const num = chkedList[i];
            deleteList.push(cafeWorkList[num]);
        }

        console.log(deleteList);

        try {
            const res = await axios.post(
                `${back_api}/cafe_work/delete_cafe_work_list`,
                { deleteList },
            );
            if (res.data.status) {
                alert("정상적으로 삭제 되었습니다.");
                invalidateAll();
                chkedList = [];
            }
        } catch (error) {}
    }
</script>

<div class="mb-5 flex">
    <form on:submit={searchDate}>
        <label class="mr-3">
            <span>시작일 : </span>
            <input
                type="date"
                name="start_date"
                bind:value={startDate}
                class="p-1 text-sm border-gray-400 rounded-md"
            />
        </label>

        <label class="mr-3">
            <span>종료일 : </span>
            <input
                type="date"
                name="end_date"
                bind:value={endDate}
                class="p-1 text-sm border-gray-400 rounded-md"
            />
        </label>
        <button
            class="py-1 px-3 bg-blue-500 active:bg-blue-600 text-white rounded-md"
        >
            검색
        </button>
    </form>
    <button
        class="py-1 px-3 bg-red-500 active:bg-red-600 text-white rounded-md ml-3"
        on:click={deleteCafeWorkListFunc}>삭제</button
    >
</div>

<div>
    <table class="w-full">
        <tr>
            <th class="border p-2 w-14">
                <input
                    type="checkbox"
                    class="rounded-md border-gray-400 focus:ring-0"
                    bind:checked={allChkcked}
                    on:change={() => {
                        console.log(allChkcked);
                        if (allChkcked) {
                            chkedList = Array.from(
                                { length: cafeWorkList.length },
                                (_, i) => i,
                            );
                        } else {
                            chkedList = [];
                        }
                    }}
                />
            </th>
            <th class="border p-2">링크</th>
            <th class="border p-2">작업횟수</th>
        </tr>

        {#each cafeWorkList as cafeWork, idx}
            <tr>
                <td class="border p-2 text-center">
                    <input
                        type="checkbox"
                        class="rounded-md border-gray-400 focus:ring-0"
                        value={idx}
                        bind:group={chkedList}
                        on:change={() => {
                            if (chkedList.length != cafeWorkList.length) {
                                allChkcked = false;
                            }else{
                                allChkcked = true;
                            }
                        }}
                    />
                </td>
                <td class="border p-2">
                    {cafeWork.cw_link}
                </td>
                <td class="border p-2">
                    {cafeWork.cw_work_count}
                </td>
            </tr>
        {/each}
    </table>
</div>
