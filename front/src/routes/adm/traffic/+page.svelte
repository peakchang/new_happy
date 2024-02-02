<script>
    import ModalCustom from "$lib/components/design/ModalCustom.svelte";
    import { Checkbox, Toggle } from "flowbite-svelte";
    import { makeNewTrafficWork } from "./func";
    import { addTrafficVal } from "$lib/store.js";
    import { goto, invalidateAll } from "$app/navigation";
    import axios from "axios";
    import { back_api } from "$src/lib/const";

    console.log($addTrafficVal);

    let trafficWorkList = [];
    let allChk = false;
    let checkedList = [];
    let trafficAddModalBool = false;
    export let data;
    $: data, setData();

    function setData() {
        if (data.trafficWorkList) {
            trafficWorkList = data.trafficWorkList;
        }

        console.log(trafficWorkList);
    }
</script>

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
            console.log(checkedList);
            let updateData = [];
            for (let i = 0; i < checkedList.length; i++) {
                const num = checkedList[i];
                updateData.push(trafficWorkList[num]);
            }
            
            try {
                const res = await axios.post(`${back_api}/traffic_work/update_data`, updateData)
            } catch (error) {
                
            }
            console.log(updateData);
        }}
    >
        선택 업데이트
    </button>

    <button
        class="bg-red-500 active:bg-red-600 py-1 px-4 rounded-md text-xs text-white mr-2"
        on:click={async (e) => {}}
    >
        선택 삭제
    </button>

    <button
        class="bg-purple-500 active:bg-purple-600 py-1 px-4 rounded-md text-xs text-white"
    >
        사용횟수 초기화
    </button>
</div>

<div class="w-full overflow-auto">
    <div class="w-full min-w-[800px]">
        <table class="w-full text-center">
            <tr class="text-xs">
                <th class="border py-2">
                    <div class="flex justify-center pl-2">
                        <Checkbox value="allchk" bind:checked={allChk} />
                    </div>
                </th>
                <th class="border py-2"> 목표링크 </th>
                <th class="border py-2"> 검색제목 </th>
                <th class="border py-2"> 추가링크(내부클릭) </th>
                <th class="border py-2"> 목표클릭 </th>
                <th class="border py-2"> 현재클릭 </th>
                <th class="border py-2"> 사용 </th>
                <th class="border py-2"> 원 링크 </th>
            </tr>

            {#each trafficWorkList as trafficWork, idx}
                <tr>
                    <td class="border p-1">
                        <div class="flex justify-center pl-2">
                            <Checkbox value={idx} bind:group={checkedList} />
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
                                bind:checked={trafficWorkList[idx]["st_use"]}
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
    </div>
</div>
