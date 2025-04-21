<script>
    import { admin_sidebar } from "$src/lib/store";
    import axios from "axios";
    import { back_api } from "$src/lib/const";
    import {
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
        Checkbox,
        Modal,
        Toggle,
    } from "flowbite-svelte";
    import { invalidateAll } from "$app/navigation";

    export let data;
    let targetData = [];

    let selectChk = [];
    let allChkVal = false;

    let addRowModal = false;
    let addManyRowModal = false;

    let manyRowVal = "";

    let addLink = "";
    let addKeyword = "";

    let targetCount = 0;

    let groupCountArr = [];

    $: data, setData(data);

    function setData(data) {
        targetData = data.targetList;
        console.log(targetData);
        groupCountArr = countByGroup(targetData);
    }

    function countByGroup(data) {
        const result = {};

        data.forEach((item) => {
            const group = `group${item.tg_group}`;
            result[group] = (result[group] || 0) + 1;
        });

        return result;
    }

    async function addRow() {
        try {
            const res = await axios.post(
                `${back_api}/adm_backlink/target_add_row`,
                {
                    tg_link: addLink,
                    tg_keyword: addKeyword,
                },
            );
            addLink = "";
            addKeyword = "";
            invalidateAll();
            alert("행 추가 완료~");
        } catch (error) {}
    }

    async function allUpdate() {
        let updateData = [];
        for (let i = 0; i < selectChk.length; i++) {
            const num = selectChk[i];
            updateData.push(targetData[num]);
        }

        try {
            const res = await axios.post(
                `${back_api}/adm_backlink/target_update`,
                {
                    updateData,
                },
            );
            console.log(res);

            if (res.status == 200) {
                invalidateAll();
                selectChk = [];
                allChkVal = 0;
            }
        } catch (error) {}
    }
    function allChk() {
        // @ts-ignore
        if (this.checked == true) {
            allChkVal = 1;
            const tempAllArr = [];
            for (var i = 0; i <= targetData.length - 1; i++) {
                tempAllArr.push(i);
            }
            selectChk = [...tempAllArr];
        } else {
            allChkVal = 0;
            selectChk = [];
        }
    }

    async function chkDelete() {
        if (selectChk.length == 0) {
            alert("삭제할 부분을 체크 해주세요");
            return false;
        }

        if (!confirm("삭제되면 복구가 불가능합니다. 진행하시겠습니까?")) {
            return false;
        }
        let deleteArr = [];
        for (let i = 0; i < selectChk.length; i++) {
            const getNum = selectChk[i];
            deleteArr.push(targetData[getNum]["tg_id"]);
        }
        console.log(deleteArr);

        try {
            const res = await axios.post(
                `${back_api}/adm_backlink/target_delete_row`,
                {
                    deleteArr,
                },
            );
            invalidateAll();
            selectChk = [];
            allChkVal = false;
            alter("삭제가 완료 되었습니다.");
        } catch (error) {}
    }

    async function resetCount() {
        try {
            const res = await axios.get(
                `${back_api}/adm_backlink/target_count_reset`,
            );

            if (res.data.status) {
                alert("초기화 완료!");
                invalidateAll();
            }
        } catch (error) {}
    }

    async function addManyRow() {
        const manyRowArr = manyRowVal.split("\n");
        console.log(manyRowArr);
        const formattedManyRowData = manyRowArr.map((item) => {
            const [tg_keyword, tg_link, tg_group] = item.split("\t");
            return { tg_keyword, tg_link, tg_group };
        });

        console.log(formattedManyRowData);

        try {
            const res = await axios.post(
                `${back_api}/adm_backlink/backlink_add_many_row`,
                { formattedManyRowData },
            );
            if (res.data.status) {
                let addStr = "";
                if (res.data.errCount > 0) {
                    addStr += `${res.data.errCount}개의 중복 데이터는 업로드 되지 않았습니다.`;
                }
                alert(`행 추가가 완료 되었습니다. ${addStr}`);
                manyRowVal = "";
                invalidateAll();
            }
        } catch (error) {}
    }
</script>

<Modal title="Terms of Service" bind:open={addRowModal} autoclose>
    <div>
        <Table hoverable={true}>
            <TableHead>
                <TableHeadCell class="border border-slate-300">
                    링크
                </TableHeadCell>
                <TableHeadCell class="border border-slate-300">
                    키워드
                </TableHeadCell>
            </TableHead>
            <TableBody tableBodyClass="divide-y">
                <TableBodyRow>
                    <TableBodyCell class="border border-slate-300 p-1 ">
                        <input
                            type="text"
                            class="w-full border-slate-300 rounded-lg text-xs"
                            bind:value={addLink}
                        />
                    </TableBodyCell>
                    <TableBodyCell class="border border-slate-300 p-1 text-sm">
                        <input
                            type="text"
                            class="w-full border-slate-300 rounded-lg"
                            bind:value={addKeyword}
                        />
                    </TableBodyCell>
                </TableBodyRow>
            </TableBody>
        </Table>
    </div>
    <svelte:fragment slot="footer">
        <button
            class="py-1 px-3 bg-blue-500 text-white rounded-lg"
            on:click={addRow}
        >
            업데이트
        </button>
    </svelte:fragment>
</Modal>

<Modal title="여러행 추가" bind:open={addManyRowModal} autoclose>
    <div>
        <textarea class="w-full" rows="10" bind:value={manyRowVal}></textarea>
    </div>
    <svelte:fragment slot="footer">
        <button
            class="py-1 px-3 bg-blue-500 text-white rounded-lg"
            on:click={addManyRow}
        >
            업데이트
        </button>
    </svelte:fragment>
</Modal>

<div class="mb-4">
    <!-- <span class="mr-4">갯수 : {targetCount}</span> -->

    <button
        class=" bg-fuchsia-700 text-white py-1 px-3 rounded-md mr-2"
        on:click={() => {
            addRowModal = true;
        }}
    >
        행 추가
    </button>

    <button
        class=" bg-green-500 active:bg-green-600 text-white py-1 px-3 rounded-md mr-2"
        on:click={() => {
            addManyRowModal = true;
        }}
    >
        여러 행 추가
    </button>

    <button
        class=" bg-green-500 active:bg-green-600 text-white py-1 px-3 rounded-md mr-2"
        on:click={allUpdate}
    >
        업데이트
    </button>
    <button
        class=" bg-red-500 active:bg-red-600 text-white py-1 px-3 rounded-md mr-2"
        on:click={chkDelete}
    >
        삭제
    </button>

    <button
        class="bg-blue-500 active:bg-blue-600 text-white py-1 px-3 rounded-md"
        on:click={resetCount}
    >
        타겟 카운트 초기화
    </button>

    {#each Object.entries(groupCountArr) as [key, value]}
        <span class="mr-3">{key}: {value}</span>
    {/each}
</div>

<div class="text-sm">
    <table class="w-full">
        <tr>
            <th class="pl-3.5 py-3 w-11 border">
                <Checkbox on:change={allChk} bind:value={allChkVal} />
            </th>
            <th class="border"> 타겟 링크 </th>
            <th class="border"> 키워드 </th>
            <th class="border"> 작업 카운트 </th>
            <th class="border"> 그룹 </th>
            <th class="border">
                <span>블로그</span>
                <br />
                <span class="text-xs font-normal"> 사용유무 </span>
            </th>
            <th class="border"> 블로그사용 </th>
            <th class="border">
                <span>백링크</span>
                <br />
                <span class="text-xs font-normal"> 사용유무 </span>
            </th>
            <th class="border"> 백링크사용 </th>
            <!-- <th class="border"> 블작업카운트 </th> -->
        </tr>
        {#each targetData as target, idx}
            <tr>
                <td class="pl-3.5 py-3 w-11 border">
                    <Checkbox value={idx} bind:group={selectChk} />
                </td>
                <td class="border">
                    <input
                        type="text"
                        class="w-full border-slate-300 rounded-lg text-sm"
                        bind:value={targetData[idx]["tg_link"]}
                    />
                </td>
                <td class="border">
                    <input
                        type="text"
                        class="w-full border-slate-300 rounded-lg text-sm"
                        bind:value={targetData[idx]["tg_keyword"]}
                    />
                </td>
                <td class="border text-center">
                    {targetData[idx]["tg_workcount"]}
                </td>
                <td class="border w-14">
                    <input
                        type="text"
                        class="w-full border-slate-300 rounded-lg text-sm"
                        bind:value={targetData[idx]["tg_group"]}
                    />
                </td>
                <td class="border">
                    <div class="text-center flex justify-center pl-2">
                        <Toggle
                            size="small"
                            bind:checked={targetData[idx]["tg_blog_work_bool"]}
                        />
                    </div>
                </td>
                <td class="border">
                    <div class="text-center flex justify-center pl-2">
                        <Toggle
                            size="small"
                            bind:checked={targetData[idx]["tg_blog_used"]}
                        />
                    </div>
                </td>
                <td class="border text-center">
                    <div class="text-center flex justify-center pl-2">
                        <Toggle
                            size="small"
                            bind:checked={targetData[idx]["tg_workbool"]}
                        />
                    </div>
                </td>
                <td class="border text-center">
                    <div class="text-center flex justify-center pl-2">
                        <Toggle
                            size="small"
                            bind:checked={targetData[idx]["tg_used"]}
                        />
                    </div>
                </td>
            </tr>
        {/each}
    </table>
</div>
