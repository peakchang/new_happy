<script>
    import ModalCustom from "$lib/components/design/ModalCustom.svelte";
    import { Checkbox, Img, Toggle } from "flowbite-svelte";
    import { makeNewTrafficWork } from "./func";
    import { addTrafficVal } from "$lib/store.js";
    import { goto, invalidateAll } from "$app/navigation";
    import axios from "axios";
    import { back_api } from "$src/lib/const";

    let formArea;
    let trafficWorkList = [];
    let allChk = false;
    let checkedList = [];
    let trafficAddModalBool = false; // 작업내용 추가시 필요한 모달
    let memoModalBook = false; // 메모 내용 확인 및 추가시 필요한 모달
    let getIdx = ""; // 메모 내용 모달 오픈시 해당 버튼의 value 값을 담기 위함
    export let data;
    $: data, setData();

    function setData() {
        if (data.trafficWorkList) {
            trafficWorkList = data.trafficWorkList;
        }
    }

    function openModal() {
        getIdx = this.value;
        memoModalBook = !memoModalBook;
    }

    function serchFilterFunc(e) {
        // e.preventDefault();
        // console.log(this);
        // this.submit();
        invalidateAll();
    }

    async function deleteRowAction() {

        if (!confirm("삭제하면 복구가 불가합니다. 진행하시겠습니까?")) {
            return;
        }

        let deleteList = [];
        for (let i = 0; i < checkedList.length; i++) {
            const num = checkedList[i];
            deleteList.push(trafficWorkList[num]["st_id"]);
        }
        const res = await axios.post(`${back_api}/traffic_work/delete_row`, {
            deleteList,
        });

        if (res.data.status) {
            alert("삭제가 완료 되었습니다.");
            invalidateAll();
        }
    }
</script>

<ModalCustom bind:open={memoModalBook} width="800">
    <div>
        <textarea
            rows="10"
            class="w-full border-gray-300 rounded-md focus:ring-0"
            bind:value={trafficWorkList[getIdx]["st_memo"]}
        ></textarea>
    </div>
</ModalCustom>

<ModalCustom bind:open={trafficAddModalBool} width="800">
    <div>
        <table class="w-full text-center">
            <tr class="text-xs">
                <th class="border py-2"> 목표링크 </th>
                <th class="border py-2"> 검색제목 </th>
                <th class="border py-2"> 추가링크(내부클릭) </th>
                <th class="border py-2"> 원 링크 </th>
            </tr>

            <tr>
                <td class="border p-1.5">
                    <input
                        type="text"
                        class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                        bind:value={$addTrafficVal["st_link"]}
                    />
                </td>
                <td class="border p-1.5">
                    <input
                        type="text"
                        class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                        bind:value={$addTrafficVal["st_subject"]}
                    />
                </td>
                <td class="border p-1.5">
                    <input
                        type="text"
                        class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                        bind:value={$addTrafficVal["st_addlink"]}
                    />
                </td>
                <td class="border p-1.5">
                    <input
                        type="text"
                        class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                        bind:value={$addTrafficVal["st_original_link"]}
                    />
                </td>
            </tr>
        </table>
    </div>
    <div class="mt-5 text-center">
        <button
            class="py-1.5 w-2/3 bg-green-500 active:bg-green-600 text-white rounded-md"
            on:click={async () => {
                const resStatus = await makeNewTrafficWork();
                if (resStatus) {
                    alert("업데이트 완료!");
                    invalidateAll();
                    $addTrafficVal = {};
                    trafficAddModalBool = false;
                } else {
                    alert("업데이트 실패!");
                }
            }}
        >
            업데이트
        </button>
    </div>
</ModalCustom>
<div class="mb-5">
    <button
        on:click={() => {
            trafficAddModalBool = !trafficAddModalBool;
        }}
        class="bg-green-500 active:bg-green-600 py-1 px-4 rounded-md text-xs text-white mr-2"
    >
        작업 내용 추가
    </button>

    <button
        class="bg-blue-500 active:bg-blue-600 py-1 px-4 rounded-md text-xs text-white mr-2"
        on:click={async () => {
            let updateData = [];
            for (let i = 0; i < checkedList.length; i++) {
                const num = checkedList[i];
                updateData.push(trafficWorkList[num]);
            }

            try {
                const res = await axios.post(
                    `${back_api}/traffic_work/update_data`,
                    updateData,
                );
                if (res.data.status) {
                    alert("업데이트 완룡");
                    invalidateAll();
                    checkedList = [];
                    allChk = false;
                }
            } catch (error) {}
        }}
    >
        선택 업데이트
    </button>

    <button
        class="bg-red-500 active:bg-red-600 py-1 px-4 rounded-md text-xs text-white mr-2"
        on:click={deleteRowAction}
    >
        선택 삭제
    </button>

    <button
        class="bg-purple-500 active:bg-purple-600 py-1 px-4 rounded-md text-xs text-white"
        on:click={async () => {
            try {
                const res = await axios.post(
                    `${back_api}/traffic_work/initial_count`,
                );
                if (res.data.status) {
                    alert("초기화 완료~");
                    invalidateAll();
                }
            } catch (error) {}
        }}
    >
        사용횟수 초기화
    </button>
</div>

<form on:submit={serchFilterFunc} bind:this={formArea}>
    <div class="flex items-center mb-3">
        <span class="mr-1">사용여부 : </span>
        <div class="mr-3">
            <label class="relative items-center mb-5 cursor-pointer">
                <input
                    type="checkbox"
                    name="use"
                    value="ok"
                    class="sr-only peer"
                />
                <div
                    class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"
                ></div>
            </label>
        </div>

        <button class="py-1 px-3 bg-blue-500 rounded-md text-white text-xs">
            적용
        </button>
    </div>

    <div class="w-full overflow-auto">
        <div class="w-full min-w-[800px]">
            <table class="w-full text-center">
                <tr class="text-xs">
                    <th class="border py-2">
                        <div class="flex justify-center pl-2">
                            <Checkbox
                                value="allchk"
                                bind:checked={allChk}
                                on:change={(e) => {
                                    if (e.target.checked) {
                                        const arr = Array.from(
                                            { length: trafficWorkList.length },
                                            (_, i) => i,
                                        );

                                        checkedList = arr;
                                    } else {
                                        checkedList = [];
                                    }
                                }}
                            />
                        </div>
                    </th>
                    <th class="border py-2"> 목표링크 </th>
                    <th class="border py-2"> 연관검색 </th>
                    <th class="border py-2"> 검색제목 </th>
                    <th class="border py-2"> 추가링크(내부클릭) </th>
                    <th class="border py-2"> 목표클릭 </th>
                    <th class="border py-2"> 현재클릭 </th>
                    <th class="border py-2"> 사용 </th>
                    <th class="border py-2"> 생성 </th>
                    <th class="border py-2"> 포함/일치 </th>
                    <th class="border py-2"> 원 링크 </th>
                </tr>

                {#each trafficWorkList as trafficWork, idx}
                    <tr class:bg-green-200={idx % 2 == 0}>
                        <td class="border p-1">
                            <div class="flex justify-center pl-2">
                                <Checkbox
                                    value={idx}
                                    bind:group={checkedList}
                                    on:change={() => {
                                        if (
                                            checkedList.length ==
                                            trafficWorkList.length
                                        ) {
                                            allChk = true;
                                        } else {
                                            allChk = false;
                                        }
                                    }}
                                />
                                <button
                                    class="w-10 py-0.5 bg-blue-500 active:bg-blue-600 rounded-md text-white"
                                    type="button"
                                    value={idx}
                                    on:click={openModal}
                                >
                                    메모
                                </button>
                            </div>
                        </td>
                        <td class="border p-1.5">
                            <input
                                type="text"
                                class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                                bind:value={trafficWorkList[idx]["st_link"]}
                            />
                        </td>
                        <td class="border p-1.5">
                            <input
                                type="text"
                                class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                                bind:value={trafficWorkList[idx][
                                    "st_relation_subject"
                                ]}
                            />
                        </td>
                        <td class="border p-1.5">
                            <input
                                type="text"
                                class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                                bind:value={trafficWorkList[idx]["st_subject"]}
                            />
                        </td>
                        <td class="border p-1.5">
                            <input
                                type="text"
                                class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                                bind:value={trafficWorkList[idx]["st_addlink"]}
                            />
                        </td>
                        <td class="border p-1 w-16">
                            <input
                                type="text"
                                class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                                bind:value={trafficWorkList[idx][
                                    "st_target_click_count"
                                ]}
                            />
                        </td>
                        <td class="border p-1.5 w-16">
                            <input
                                type="text"
                                class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                                bind:value={trafficWorkList[idx][
                                    "st_now_click_count"
                                ]}
                            />
                        </td>
                        <td class="border p-1.5">
                            <div class="text-center flex justify-center pl-2">
                                <Toggle
                                    size="small"
                                    bind:checked={trafficWorkList[idx][
                                        "st_use"
                                    ]}
                                />
                            </div>
                        </td>

                        <td class="border p-1.5">
                            <div class="text-center flex justify-center pl-2">
                                <Toggle
                                    size="small"
                                    bind:checked={trafficWorkList[idx][
                                        "st_work_type"
                                    ]}
                                />
                            </div>
                        </td>
                        <td class="border p-1.5">
                            <div class="text-center flex justify-center pl-2">
                                <Toggle
                                    size="small"
                                    bind:checked={trafficWorkList[idx][
                                        "st_correspond"
                                    ]}
                                />
                            </div>
                        </td>
                        <td class="border p-1.5">
                            <input
                                type="text"
                                class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                                bind:value={trafficWorkList[idx][
                                    "st_original_link"
                                ]}
                            />
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
</form>
