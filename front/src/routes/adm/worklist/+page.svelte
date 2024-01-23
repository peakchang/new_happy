<script>
    import { admin_sidebar } from "$src/lib/store";
    import {
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
    } from "flowbite-svelte";
    import { goto, invalidateAll } from "$app/navigation";
    export let data;
    let workList = data.workList;

    let date = new Date();
    let setDate = date;

    async function chkDate() {
        var year = setDate.getFullYear();
        var month = String(setDate.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1 해주고 2자리로 포맷합니다.
        var day = String(setDate.getDate()).padStart(2, "0");
        var formattedDate = year + "-" + month + "-" + day;
        console.log(formattedDate);
        goto(`?date=${formattedDate}`);
    }
</script>

<div class="mb-4 flex gap-3">
    <div class="flex items-center gap-2">
        <span>날짜 선택 : </span>
        <button
            class=" bg-green-700 text-white py-1 px-3 rounded-md"
            on:click={chkDate}
        >
            변경
        </button>
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
