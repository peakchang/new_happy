<script>
    import axios from "axios";
    import { back_api } from "$src/lib/const";
    import { Modal, Toggle } from "flowbite-svelte";
    import { invalidateAll } from "$app/navigation";

    let backlinkData = [];
    let backIdValList = [];
    let backWorkBool = [];
    let backlinkValList = [];
    let statusValList = [];
    let idValList = [];
    let pwdValList = [];
    let memoValList = [];

    let checkedList = [];

    let allChecked = false;

    let allCount = 0;

    export let data;

    $: data, setData();

    function setData() {
        console.log("셋데이터는 들어올거 아녀??");
        console.log(data);

        backlinkData = data.backlinkList;
        console.log(backlinkData);
    }

    // 모달 관련
    let addRowModal = false;
    let placement = "top-center";

    let chkScriptModalBool = false;

    let updateChkScriptNum = 0;

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
        console.log(checkedList);

        if (checkedList.length == 0) {
            alert("업데이트 할 항목을 선택해주세요");
            return false;
        }

        const updateArr = checkedList.map((ele) => backlinkData[ele]);
        console.log(updateArr);

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
            alert("삭제 할 항목을 선택해주세요");
            return false;
        }
        if (!confirm("삭제한 내용은 복구가 불가능합니다. 진행?")) {
            return false;
        }

        const deleteIdArr = checkedList.map((e) => backlinkData[e]["bl_id"]);

        const res = await axios.post(
            `${back_api}/adm_backlink/backlink_delete_row`,
            { deleteIdArr },
        );
        if (res.data.status) {
            checkedList = [];
            invalidateAll();
        }
    }

    function openChkScript() {
        updateChkScriptNum = this.value;
        chkScriptModalBool = true;
    }

    async function initialRow() {
        if (!confirm("초기화 진행?!?!")) {
            return false;
        }
        const res = await axios.post(`${back_api}/adm_backlink/initial_row`);
        if (res.data.status) {
            alert("초기화 완료!!!");
            invalidateAll();
        }
    }
</script>

<Modal bind:open={addRowModal} {placement} autoclose outsideclose>
    <div class="mt-7">
        <table>
            <tr>
                <th>백링크</th>
                <td>
                    <input
                        type="text"
                        class="w-full p-2 rounded-lg border-slate-400 focus:ring-0"
                        bind:value={bl_link}
                    />
                </td>
            </tr>
        </table>
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

<Modal bind:open={chkScriptModalBool} autoclose outsideclose>
    <div class="mt-7">
        <textarea
            class="w-full border-gray-500 rounded-lg"
            rows="10"
            bind:value={backlinkData[updateChkScriptNum]["bl_add_script"]}
        ></textarea>

        <div class="text-center">
            <button
                class="w-2/3 bg-yellow-500 active:bg-yellow-600 py-2 rounded-lg text-white"
            >
                닫기
            </button>
        </div>
    </div>
</Modal>

<div>
    <span class="mr-3">갯수 : {allCount}</span>
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

    <button
        class="bg-red-500 px-3 py-1 rounded-md text-white"
        on:click={initialRow}
    >
        초기화
    </button>
</div>

<div class="w-full min-w-[800px] overflow-auto mt-5">
    <div class="w-full max-w-[1200px]">
        <table class="w-full">
            <tr>
                <th class="border p-2 w-12">
                    <input
                        type="checkbox"
                        on:change={(e) => {
                            if (e.target.checked == true) {
                                checkedList = Array.from(
                                    { length: backlinkData.length },
                                    (_, i) => i,
                                );
                            } else {
                                checkedList = [];
                            }
                        }}
                    />
                </th>
                <th class="border p-2">백링크</th>
                <th class="border p-2">상태</th>
                <th class="border p-2">작업</th>
                <th class="border p-2">테스트</th>
                <th class="border p-2">메모</th>
                <th class="border p-2">버튼명</th>
                <th class="border p-2">아이디</th>
                <th class="border p-2">비번</th>
                <th class="border p-2">sc</th>
            </tr>
            {#each backlinkData as data, idx}
                <tr>
                    <td class="border p-2 w-12 text-center">
                        <input
                            type="checkbox"
                            class="mx-auto"
                            value={idx}
                            bind:group={checkedList}
                            on:change={() => {
                                if (checkedList.length != backlinkData.length) {
                                    allChecked = false;
                                }
                            }}
                        />
                    </td>
                    <td class="border py-2 px-0.5">
                        <input
                            type="text"
                            class="w-full py-1.5 px-2.5 rounded-lg border-slate-300 focus:ring-0 text-xs"
                            bind:value={backlinkData[idx]["bl_link"]}
                        />
                    </td>

                    <td class="border py-2 px-0.5">
                        <div class="flex justify-center">
                            <Toggle
                                class="mx-auto"
                                value={idx}
                                size="small"
                                bind:checked={backlinkData[idx]["bl_status"]}
                            />
                        </div>
                    </td>

                    <td class="border py-2 px-0.5">
                        <div class="flex justify-center">
                            <Toggle
                                class="mx-auto"
                                value={idx}
                                size="small"
                                bind:checked={backlinkData[idx]["bl_work_bool"]}
                            />
                        </div>
                    </td>

                    <td class="border py-2 px-0.5">
                        <div class="flex justify-center">
                            <Toggle
                                class="mx-auto"
                                value={idx}
                                size="small"
                                bind:checked={backlinkData[idx][
                                    "bl_priority_work"
                                ]}
                            />
                        </div>
                    </td>

                    <td class="border py-2 px-0.5">
                        <input
                            type="text"
                            class="w-full py-1.5 px-2.5 rounded-lg border-slate-300 focus:ring-0 text-xs"
                            bind:value={backlinkData[idx]["bl_memo"]}
                        />
                    </td>
                    <td class="border py-2 px-0.5 max-w-44">
                        <div class="flex">
                            <div>
                                <div class="text-xs">글쓰기</div>

                                <input
                                    type="text"
                                    class="w-full py-1.5 px-2.5 rounded-lg border-slate-300 focus:ring-0 text-xs"
                                    bind:value={backlinkData[idx][
                                        "bl_write_btn_name"
                                    ]}
                                />
                            </div>
                            <div>
                                <div class="text-xs">작성완료</div>
                                <input
                                    type="text"
                                    class="w-full py-1.5 px-2.5 rounded-lg border-slate-300 focus:ring-0 text-xs"
                                    bind:value={backlinkData[idx][
                                        "bl_submit_name"
                                    ]}
                                />
                            </div>
                        </div>
                    </td>
                    <td class="border py-2 px-0.5 max-w-20">
                        <input
                            type="text"
                            class="w-full py-1.5 px-2.5 rounded-lg border-slate-300 focus:ring-0 text-xs"
                            bind:value={backlinkData[idx]["bl_siteid"]}
                        />
                    </td>
                    <td class="border py-2 px-0.5 max-w-20">
                        <input
                            type="text"
                            class="w-full py-1.5 px-2.5 rounded-lg border-slate-300 focus:ring-0 text-xs"
                            bind:value={backlinkData[idx]["bl_sitepwd"]}
                        />
                    </td>
                    <td
                        class="border py-2 px-0.5 max-w-20 min-w-10 text-center"
                    >
                        <button
                            class="bg-blue-500 active:bg-blue-600 py-1 w-10/12 rounded-md text-white"
                            value={idx}
                            on:click={openChkScript}
                        >
                            확인{backlinkData[idx]["bl_add_script"] ? "0" : ""}
                        </button>
                    </td>
                </tr>
            {/each}
        </table>
    </div>
</div>
