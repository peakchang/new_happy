<script>
    import { Checkbox, Toggle } from "flowbite-svelte";
    import { back_api } from "$src/lib/const";
    import axios from "axios";
    import moment from "moment-timezone";
    import { invalidateAll } from "$app/navigation";
    let allData = [];
    export let data;

    let checkedList = [];

    $: data, setData();
    function setData() {
        allData = data.allData;
        console.log(allData);
    }

    async function deleteRow() {
        let deletedList = [];
        for (let i = 0; i < checkedList.length; i++) {
            const num = checkedList[i];
            deletedList.push(allData[num]);
        }

        console.log(deletedList);

        try {
            const res = await axios.post(
                `${back_api}/traffic_work/delete_last_traffic_row`,
                { deletedList },
            );

            if (res.data.status) {
                checkedList = [];
                invalidateAll();
            }
        } catch (error) {}
    }
</script>

<div class="mb-3">
    <button
        class="bg-red-500 active:bg-red-600 text-white py-1 px-3 rounded-md"
        on:click={deleteRow}
    >
        DELETE
    </button>
</div>

<div class="w-full min-w-[800px] overflow-auto">
    <div class="w-full max-w-[1200px]">
        <table class="w-full text-center">
            <tr>
                <th class="border py-2 w-12">
                    <Checkbox class="justify-center mr-0"></Checkbox>
                </th>
                <th class="border py-2">아이디</th>
                <th class="border py-2">마지막 작업 시간</th>
            </tr>
            {#each allData as data, idx}
                <tr>
                    <td class="border py-2 w-12">
                        <Checkbox
                            class="justify-center mr-0"
                            value={idx}
                            bind:group={checkedList}
                        />
                    </td>
                    <td class="border py-2">{data.lt_name}</td>
                    <td class="border py-2"
                        >{moment(data.lt_last_time).format(
                            "YY/MM/DD HH:mm:ss",
                        )}</td
                    >
                </tr>
            {/each}
        </table>
    </div>
</div>
