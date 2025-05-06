<script>
    import axios from "axios";
    import moment from "moment-timezone";
    moment.tz.setDefault("Asia/Seoul");
    import { back_api } from "$src/lib/const";
    import { Modal, Toggle } from "flowbite-svelte";
    import { invalidateAll } from "$app/navigation";

    let backlinkData = [];
    let lastWorkList = [];

    let checkedList = [];

    let allChecked = false;

    let allCount = 0;

    export let data;

    $: data, setData();

    function setData() {
        backlinkData = data.backlinkList;
        lastWorkList = data.lastWorkList;
    }

    // 모달 관련
    let addRowModal = false;
    let placement = "top-center";

    let chkScriptModalBool = false;

    let updateChkScriptNum = 0;

    // 백링크 추가
    let bl_link_con = "";
    let blLinkArea;

    async function addRow() {
        const links = bl_link_con
            .trim()
            .split("\n")
            .map((line) => {
                const [link, board] = line.split(",");
                return { link: link.trim(), board: board.trim() };
            });
        try {
            const res = await axios.post(
                `${back_api}/adm_backlink/backlink_add_row`,
                {
                    links,
                },
            );
            if (res.status == 200) {
                let addMessage = "";
                if (res.data.duplicateCount) {
                    addMessage = `${res.data.duplicateCount}건의 링크가 중복됩니다.`;
                }
                alert(`업로드 완료! ${addMessage}`);
                invalidateAll();
                bl_link_con = "";
            } else {
                alert("오류가 발생 했습니다.");
            }
        } catch (error) {}
    }

    async function updateRow() {
        if (checkedList.length == 0) {
            alert("업데이트 할 항목을 선택해주세요");
            return false;
        }

        const updateArr = checkedList.map((ele) => backlinkData[ele]);

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
        if (res.status == 200) {
            alert("초기화 완료!!!");
            invalidateAll();
        }
    }
</script>

<Modal bind:open={addRowModal} {placement} autoclose outsideclose>
    <div class="mt-7">
        <div class="mb-3">백링크 리스트! (링크,게시판)</div>
        <div>
            <textarea
                class="w-full focus:outline-none"
                rows="8"
                bind:value={bl_link_con}
            ></textarea>
        </div>
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

<div class="mt-2">
    <table>
        {#each lastWorkList as lastWork}
            <td class="border py-1 px-3">
                {lastWork.bl_pc_id}
            </td>
            <td class="border py-1 px-3">
                {moment(lastWork.bl_last_work_time).format("YY/MM/DD HH:mm:ss")}
            </td>
            <td class="border py-1 px-3">
                <button
                    class="py-1 px-2 text-xs rounded-md bg-pink-500 text-white"
                    value={lastWork.id}
                    on:click={() => {
                        alert("준비중!!");
                    }}
                >
                    ID 삭제
                </button>
            </td>
        {/each}
        <tr></tr>
    </table>
</div>

<div class="w-full min-w-[800px] overflow-auto mt-5 mb-10">
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
                <th class="border p-2">게시판</th>
                <th class="border p-2">상태</th>
                <th class="border p-2">작업</th>
                <th class="border p-2">문제</th>
                <th class="border p-2">테스트</th>
                <th class="border p-2">메모</th>
                <th class="border p-2">아이디</th>
                <th class="border p-2">비번</th>
                <th class="border p-2">BTN</th>
                <th class="border p-2">script</th>
            </tr>
            {#each backlinkData as data, idx}
                <tr style="background-color:{idx % 2 == 1 ? '#FFFFE4' : ''}">
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

                    <td class="border py-2 px-0.5 w-20">
                        <input
                            type="text"
                            class="w-full py-1.5 px-2.5 rounded-lg border-slate-300 focus:ring-0 text-xs"
                            bind:value={backlinkData[idx]["bl_board"]}
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
                                bind:checked={backlinkData[idx]["bl_problem"]}
                            />
                        </div>
                    </td>

                    <td class="border py-2 px-0.5">
                        <div class="flex justify-center">
                            <Toggle
                                class="mx-auto"
                                value={idx}
                                size="small"
                                bind:checked={backlinkData[idx]["bl_test"]}
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
                        <a href="{backlinkData[idx]["bl_link"]}/bbs/board.php?bo_table={backlinkData[idx]["bl_board"]}" target="_blank">
                            <button
                                class="bg-orange-400 active:bg-orange-500 py-1 w-10/12 rounded-md text-white text-xs"
                            >
                                바로가기
                            </button>
                        </a>
                    </td>

                    <td
                        class="border py-2 px-0.5 max-w-20 min-w-10 text-center"
                    >
                        <button
                            class="bg-blue-500 active:bg-blue-600 py-1 w-10/12 rounded-md text-white text-xs"
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
