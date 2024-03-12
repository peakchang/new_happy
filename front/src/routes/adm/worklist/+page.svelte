<script>
    import {
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
    } from "flowbite-svelte";
    import { goto, invalidateAll } from "$app/navigation";

    import moment from "moment-timezone";
    moment.tz.setDefault("Asia/Seoul");

    export let data;

    $: data, setData();
    let workList = [];
    let setDate = moment().format("YYYY-MM-DD");

    function setData() {
        workList = data.workList;
        console.log(data.getDate);
        if (data.getDate) {
            setDate = data.getDate;
        }
    }

    let cafeWorkList = [];

    function dateForm() {
        invalidateAll();
    }
</script>

<div class="mb-4 flex gap-3">
    <div class="flex items-center gap-2">
        <span>날짜 선택 : </span>

        <form on:submit={dateForm}>
            <input
                type="date"
                name="date"
                bind:value={setDate}
                class="text-xs p-1 rounded-md border-gray-400"
            />

            <button class=" bg-green-700 text-white py-1 px-3 rounded-md">
                변경
            </button>
        </form>
    </div>

    <button class=" bg-green-700 text-white py-1 px-3 rounded-md">
        삭제
    </button>
</div>

<div>
    <Table hoverable={true} striped={true}>
        <TableHead>
            <TableHeadCell class="border border-slate-300">번호</TableHeadCell>
            <TableHeadCell class="border border-slate-300">링크</TableHeadCell>
            <TableHeadCell class="border border-slate-300">시간</TableHeadCell>
        </TableHead>

        {#each workList as work, idx}
            <TableBody tableBodyClass="divide-y">
                <TableBodyRow>
                    <TableBodyCell
                        class="border border-slate-300 p-1 text-center"
                    >
                        {idx}
                    </TableBodyCell>
                    <TableBodyCell class="border border-slate-300 p-1 ">
                        <a href={work.bw_link} target="_blank">
                            {work.bw_link}
                        </a>
                    </TableBodyCell>
                    <TableBodyCell class="border border-slate-300 p-1 text-sm">
                        {work.date_str}
                    </TableBodyCell>
                </TableBodyRow>
            </TableBody>
        {/each}
    </Table>
</div>

<style>
    :global(.date-time-field input) {
        border-radius: 10px;
        font-size: 14px;
    }
</style>
