<script>
    import ModalCustom from "$lib/components/design/ModalCustom.svelte";
    import { Checkbox, Img, Toggle } from "flowbite-svelte";
    import { goto, invalidateAll } from "$app/navigation";
    import axios from "axios";
    import { back_api } from "$src/lib/const";

    let formArea;
    let userAgentInsertValue = "";
    let chkedList = [];
    let allChecked = false;
    let allData = [];
    let trafficAddModalBool = false; // 작업내용 추가시 필요한 모달
    let addTrafficValues = {};
    let memoModalBool = false; // 메모 내용 확인 및 추가시 필요한 모달
    let getStId = ""; // 메모 내용 모달 오픈시 해당 버튼의 value 값을 담기 위함
    let memoType = "";
    let allCount = 0;
    let lineNum = 0;

    export let data;
    $: data, setData();

    function setData() {
        allData = data.allData;
        allCount = data.allCount;
    }

    async function uaFormAct(e) {
        e.preventDefault();
        const action = e.submitter.value;

        if (action == "update") {
            if (chkedList.length == 0) {
                alert("업데이트 할 항목을 선택해주세요");
                return false;
            }
            // ★ 업데이트를 하는 부분이니까 업데이트!!!!!!!!!!!!!
            let updateList = chkedList.map((index) => allData[index]);
            try {
                const res = await axios.post(
                    `${back_api}/traffic_work/update_traffic_loop`,
                    {
                        updateList,
                    },
                );
                if (res.data.status) {
                    invalidateAll();
                    chkedList = [];
                    allChecked = false;
                    alert("업데이트가 완료 되었습니다.");
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
            let deleteList = chkedList.map((index) => allData[index]["st_id"]);
            try {
                const res = await axios.post(
                    `${back_api}/traffic_work/delete_traffic_loop`,
                    {
                        deleteList,
                    },
                );
                if (res.data.status) {
                    invalidateAll();
                    chkedList = [];
                    allChecked = false;
                    alert("삭제가 완료 되었습니다.");
                }
            } catch (error) {}
        }
    }

    async function openMemoModal(e) {
        lineNum = e.target.value;
        getStId = allData[e.target.value]["st_id"];
        try {
            const res = await axios.post(
                `${back_api}/traffic_work/get_memo_content`,
                { memoType, getStId },
            );

            if (res.data.status) {
                if (memoType == "st_rate_memo") {
                    allData[lineNum]["st_rate_memo"] = res.data.memo_content;
                }

                if (!allData[lineNum][memoType]) {
                    allData[lineNum][memoType] = "";
                }
                memoModalBool = true;
            }
        } catch (error) {
            console.error(error.message);
        }
    }
</script>

<ModalCustom bind:open={memoModalBool} width="800">
    <div>
        <textarea
            rows="10"
            class="w-full border-gray-300 rounded-md focus:ring-0"
            bind:value={allData[lineNum][memoType]}
        ></textarea>
    </div>
</ModalCustom>

<!-- bind:value={allData[lineNum][memoType]} -->

<ModalCustom bind:open={trafficAddModalBool} width="800">
    <div>
        <table class="w-full text-center">
            <tr class="text-xs">
                <th class="border py-2"> 목표링크 </th>
                <th class="border py-2"> 검색제목 </th>
                <th class="border py-2"> 추가링크(내부클릭) </th>
            </tr>

            <tr>
                <td class="border p-1.5">
                    <input
                        type="text"
                        class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                        bind:value={addTrafficValues["st_link"]}
                    />
                </td>
                <td class="border p-1.5">
                    <input
                        type="text"
                        class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                        bind:value={addTrafficValues["st_subject"]}
                    />
                </td>
                <td class="border p-1.5">
                    <input
                        type="text"
                        class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                        bind:value={addTrafficValues["st_addlink"]}
                    />
                </td>
            </tr>
        </table>
    </div>
    <div class="mt-5 text-center">
        <button
            class="py-1.5 w-2/3 bg-green-500 active:bg-green-600 text-white rounded-md"
            on:click={async () => {
                try {
                    const res = await axios.post(
                        `${back_api}/traffic_work/add_row_traffic_loop`,
                        { addTrafficValues },
                    );
                    if (res.data.status) {
                        addTrafficValues = {};
                        trafficAddModalBool = false;
                        invalidateAll();
                    }
                } catch (error) {}
            }}
        >
            업데이트
        </button>
    </div>
</ModalCustom>

<form on:submit={uaFormAct} bind:this={formArea}>
    <div class="flex gap-2 items-center">
        <span class="pr-2">전체 : {allCount}</span>
        <button
            type="button"
            class="px-5 py-1 rounded-md bg-blue-500 active:bg-blue-600 text-white"
            on:click={() => {
                trafficAddModalBool = true;
            }}
        >
            행 추가
        </button>
        <button
            value="update"
            class="px-5 py-1 rounded-md bg-green-500 active:bg-green-600 text-white"
        >
            업데이트
        </button>
        <button
            value="delete"
            class="px-5 py-1 rounded-md bg-red-500 active:bg-red-600 text-white"
        >
            행 삭제
        </button>
    </div>
</form>

<div class="my-5 border p-2 text-xs rounded-md">
    목표 클릭을 1000개 이상으로 셋팅해 놓으면 무한루프 돌아감! 그냥 99999
    박아놓자!
</div>

<div class="w-full min-w-[800px] overflow-auto">
    <div class="w-full max-w-[1200px]">
        <table class="w-full text-center">
            <tr class="text-xs">
                <th class="border py-2">
                    <div class="flex justify-center pl-2">
                        <Checkbox
                            value="allchk"
                            bind:checked={allChecked}
                            on:change={(e) => {
                                if (e.target.checked) {
                                    const arr = Array.from(
                                        { length: allData.length },
                                        (_, i) => i,
                                    );
                                    chkedList = arr;
                                } else {
                                    chkedList = [];
                                }
                            }}
                        />
                    </div>
                </th>
                <th class="border py-2"> 목표링크 </th>
                <th class="border py-2"> 검색제목 </th>
                <th class="border py-2"> 추가링크(내부클릭) </th>
                <th class="border py-2"> 목표클릭 </th>
                <th class="border py-2"> 현재클릭 </th>
                <th class="border py-2 w-12"> 사용 </th>
                <th class="border py-2 w-12"> 카페 </th>
                <th class="border py-2 w-12"> 포함/일치 </th>
                <th class="border py-2 w-12"> 상태 </th>
                <th class="border py-2 w-12"> 방식 </th>
                <th class="border py-2"> 그룹 </th>
                <th class="border py-2"> 메모 </th>
            </tr>

            {#each allData as data, idx}
                <tr class:bg-green-200={idx % 2 == 0}>
                    <td class="border p-1">
                        <div class="flex justify-center pl-2">
                            <Checkbox
                                value={idx}
                                bind:group={chkedList}
                                on:change={() => {
                                    if (chkedList.length == allData.length) {
                                        allChecked = true;
                                    } else {
                                        allChecked = false;
                                    }
                                }}
                            />
                        </div>
                    </td>
                    <td class="border p-1.5">
                        <input
                            type="text"
                            class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                            bind:value={allData[idx]["st_link"]}
                        />
                    </td>
                    <td class="border p-1.5">
                        <input
                            type="text"
                            class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                            bind:value={allData[idx]["st_subject"]}
                        />
                    </td>
                    <td class="border p-1.5">
                        <input
                            type="text"
                            class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                            bind:value={allData[idx]["st_addlink"]}
                        />
                    </td>
                    <td class="border p-1 w-16">
                        <input
                            type="text"
                            class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                            bind:value={allData[idx]["st_target_click_count"]}
                        />
                    </td>
                    <td class="border p-1.5 w-16">
                        <input
                            type="text"
                            class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                            bind:value={allData[idx]["st_now_click_count"]}
                        />
                    </td>

                    <td class="border p-1.5">
                        <div class="text-center flex justify-center pl-2">
                            <Toggle
                                size="small"
                                bind:checked={allData[idx]["st_use"]}
                            />
                        </div>
                    </td>

                    <td class="border p-1.5">
                        <div class="text-center flex justify-center pl-2">
                            <Toggle
                                size="small"
                                bind:checked={allData[idx]["st_work_type"]}
                            />
                        </div>
                    </td>
                    <td class="border p-1.5">
                        <div class="text-center flex justify-center pl-2">
                            <Toggle
                                size="small"
                                bind:checked={allData[idx]["st_correspond"]}
                            />
                        </div>
                    </td>

                    <td class="border p-1.5">
                        <div class="text-center flex justify-center pl-2">
                            <select
                                class="text-xs p-1 border-gray-400 rounded-md"
                                bind:value={allData[idx]["st_work_type2"]}
                            >
                                <option value="random">랜덤</option>
                                <option value="make">생성</option>
                                <option value="click">클릭</option>
                            </select>
                        </div>
                    </td>

                    <td class="border p-1.5">
                        <div class="text-center flex justify-center pl-2">
                            <Toggle
                                size="small"
                                bind:checked={allData[idx]["st_click_bool"]}
                            />
                        </div>
                    </td>

                    <td class="border p-1.5 w-16">
                        <input
                            type="text"
                            class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                            bind:value={allData[idx]["st_group"]}
                        />
                    </td>

                    <td class="border py-1">
                        <div class="text-center flex justify-center gap-1">
                            <button
                                class="w-14 py-1 bg-blue-500 active:bg-blue-600 rounded-md text-white text-xs"
                                type="button"
                                on:click={(e) => {
                                    memoType = "st_rate_memo";
                                    openMemoModal(e);
                                }}
                                value={idx}
                            >
                                순위메모
                            </button>

                            <!-- <button
                                class="w-10 py-1 bg-blue-500 active:bg-blue-600 rounded-md text-white text-xs"
                                type="button"
                                on:click={(e) => {
                                    memoType = "st_memo";
                                    openMemoModal(e);
                                }}
                                value={idx}
                            >
                                메모
                            </button> -->
                            <button
                                class="w-10 py-1 bg-blue-500 active:bg-blue-600 rounded-md text-white text-xs"
                                type="button"
                                on:click={(e) => {
                                    memoType = "st_unique_link";
                                    openMemoModal(e);
                                }}
                                value={idx}
                            >
                                링크
                            </button>
                        </div>
                    </td>
                </tr>
            {/each}
        </table>

        <div class="flex mt-5 justify-center gap-1">
            <button
                name="page"
                value="1"
                class="w-7 h-7 flex justify-center items-center border rounded-md"
            >
                <i class="fa fa-angle-left text-lg" aria-hidden="true"></i>
            </button>

            <button
                name="page"
                value="1"
                class="w-7 h-7 flex justify-center items-center border rounded-md"
            >
                1
            </button>

            <button
                name="page"
                value="1"
                class="w-7 h-7 flex justify-center items-center border rounded-md"
            >
                <i class="fa fa-angle-right text-lg" aria-hidden="true"></i>
            </button>
        </div>
    </div>
</div>
