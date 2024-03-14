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
        Toggle,
        Modal,
    } from "flowbite-svelte";
    import { invalidateAll } from "$app/navigation";

    let backlinkList = [];
    let backIdValList = [];
    let backWorkBool = [];
    let backlinkValList = [];
    let statusValList = [];
    let idValList = [];
    let pwdValList = [];
    let memoValList = [];

    let checkedList = [];

    let allChecked = false;

    export let data;

    $: data, setData();

    function setData() {
        console.log("셋데이터는 들어올거 아녀??");
        backlinkList = [];
        backIdValList = [];
        backlinkValList = [];
        statusValList = [];
        idValList = [];
        pwdValList = [];
        memoValList = [];
        backWorkBool = [];

        backlinkList = data.backlinkList;
        console.log(backlinkList);

        for (let i = 0; i < backlinkList.length; i++) {
            backIdValList.push(backlinkList[i].bl_id);
            backlinkValList.push(backlinkList[i].bl_link);
            statusValList.push(
                backlinkList[i]["bl_status"] == 1 ? true : false,
            );
            idValList.push(backlinkList[i].bl_siteid);
            pwdValList.push(backlinkList[i].bl_sitepwd);
            memoValList.push(backlinkList[i].bl_memo);
            backWorkBool.push(
                backlinkList[i]["bl_work_bool"] == 1 ? true : false,
            );
        }
    }

    // 모달 관련
    let addRowModal = false;
    let placement = "top-center";

    // 백링크 추가
    let bl_link = "";
    let blLinkArea;

    async function addRow() {
        try {
            const res = await axios.post(
                `${back_api}/adm_backlink/backlink_add_row`,
                {
                    bl_link,
                },
            );
            if (res.data.status) {
                invalidateAll();
                bl_link = "";
            } else {
                alert("중복된 링크입니다.");
            }
        } catch (error) {}
    }

    async function updateRow() {
        if (checkedList.length == 0) {
            alert("업데이트 할 항목을 선택해주세요");
            return false;
        }

        let updateArr = [];
        for (let i = 0; i < checkedList.length; i++) {
            const num = checkedList[i];
            const obj = {
                bl_id: backIdValList[num],
                bl_link: backlinkValList[num],
                bl_status: statusValList[num],
                bl_siteid: idValList[num],
                bl_sitepwd: pwdValList[num],
                bl_memo: memoValList[num],
                bl_work_bool : backWorkBool[num],
            };
            updateArr.push(obj);
        }

        const res = await axios.post(
            `${back_api}/adm_backlink/backlink_update`,
            { updateArr },
        );
        if (res.data.status) {
            checkedList = [];
            allChecked = false;
            invalidateAll();
            alert("업데이트 완료");
        }
    }

    async function deleteRow() {
        if (checkedList.length == 0) {
            alert("업데이트 할 항목을 선택해주세요");
            return false;
        }
        if (!confirm("삭제한 내용은 복구가 불가능합니다. 진행?")) {
            return false;
        }

        let deleteIdArr = [];
        for (let i = 0; i < checkedList.length; i++) {
            const num = checkedList[i];
            deleteIdArr.push(backIdValList[num]);
        }

        const res = await axios.post(
            `${back_api}/adm_backlink/backlink_delete_row`,
            { deleteIdArr },
        );
        if (res.data.status) {
            checkedList = [];
            invalidateAll();
        }
    }
</script>

<Modal bind:open={addRowModal} {placement} autoclose outsideclose>
    <div class="mt-7">
        <Table>
            <TableBody>
                <TableBodyRow>
                    <TableHeadCell class="border p-2 text-center">
                        백링크
                    </TableHeadCell>
                    <TableBodyCell class="border p-2">
                        <input
                            type="text"
                            class="w-full p-2 rounded-lg border-slate-400 focus:ring-0"
                            bind:value={bl_link}
                        />
                    </TableBodyCell>
                </TableBodyRow>
            </TableBody>
        </Table>
    </div>
    <div class="text-right px-3">
        <button
            class="bg-blue-500 px-3 py-1 rounded-md text-white"
            on:click={addRow}
        >
            추가하기
        </button>
    </div>
</Modal>

<div>
    <button
        class="bg-blue-500 px-3 py-1 rounded-md text-white"
        on:click={() => {
            addRowModal = !addRowModal;
            console.log(blLinkArea);
        }}
        >행추가
    </button>

    <button
        class="bg-green-500 px-3 py-1 rounded-md text-white"
        on:click={updateRow}
    >
        업데이트
    </button>

    <button
        class="bg-red-500 px-3 py-1 rounded-md text-white"
        on:click={deleteRow}
    >
        삭제
    </button>
</div>

<div class="mt-5">
    <Table striped={true}>
        <TableHead>
            <TableHeadCell class="border p-2 w-14">
                <Checkbox
                    class="mx-auto"
                    bind:checked={allChecked}
                    on:change={() => {
                        console.log(allChecked);
                        if (allChecked) {
                            const tempChecked = Array.from(
                                { length: backlinkList.length },
                                (_, index) => index,
                            );
                            checkedList = tempChecked;
                        } else {
                            checkedList = [];
                        }
                    }}
                />
            </TableHeadCell>
            <TableHeadCell class="border p-2">백링크</TableHeadCell>
            <TableHeadCell class="border p-2">상태</TableHeadCell>
            <TableHeadCell class="border p-2">작업</TableHeadCell>
            <TableHeadCell class="border p-2">메모</TableHeadCell>
            <TableHeadCell class="border p-2">아이디</TableHeadCell>
            <TableHeadCell class="border p-2">비번</TableHeadCell>
        </TableHead>
        <TableBody>
            {#each backlinkList as backlink, idx}
                <TableBodyRow>
                    <TableBodyCell class="border p-1 w-14">
                        <Checkbox
                            class="mx-auto"
                            value={idx}
                            bind:group={checkedList}
                            on:change={() => {
                                if (checkedList.length != backlinkList.length) {
                                    allChecked = false;
                                }
                            }}
                        />
                    </TableBodyCell>

                    <TableBodyCell class="border p-2">
                        <input
                            type="text"
                            class="w-full py-1 px-2.5 rounded-lg border-slate-300 focus:ring-0 text-sm"
                            bind:value={backlinkValList[idx]}
                        />
                    </TableBodyCell>

                    <TableBodyCell class="border p-2">
                        <div class="flex justify-center">
                            <Toggle
                                class="mx-auto"
                                value={idx}
                                size="small"
                                bind:checked={statusValList[idx]}
                            />
                        </div>
                    </TableBodyCell>

                    <TableBodyCell class="border p-2">
                        <div class="flex justify-center">
                            <Toggle
                                class="mx-auto"
                                value={idx}
                                size="small"
                                bind:checked={backWorkBool[idx]}
                            />
                        </div>
                    </TableBodyCell>

                    <TableBodyCell class="border p-2">
                        <input
                            type="text"
                            class="w-full py-1 px-2.5 rounded-lg border-slate-300 focus:ring-0 text-sm"
                            bind:value={memoValList[idx]}
                        />
                    </TableBodyCell>

                    <TableBodyCell class="border p-2 w-1/6">
                        <input
                            type="text"
                            class="w-full py-1 px-2.5 rounded-lg border-slate-300 focus:ring-0 text-sm"
                            bind:value={idValList[idx]}
                        />
                    </TableBodyCell>
                    <TableBodyCell class="border p-2 w-1/6">
                        <input
                            type="text"
                            class="w-full py-1 px-2.5 rounded-lg border-slate-300 focus:ring-0 text-sm"
                            bind:value={pwdValList[idx]}
                        />
                    </TableBodyCell>
                </TableBodyRow>
            {/each}
        </TableBody>
    </Table>
</div>
