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
    let addManyRowModalBool = false; // 여러 행 추가시~~
    let manyRow = "";

    let addTrafficValues = {};
    let memoModalBool = false; // 메모 내용 확인 및 추가시 필요한 모달
    let getStId = ""; // 메모 내용 모달 오픈시 해당 버튼의 value 값을 담기 위함
    let memoType = "";
    let allCount = 0;
    let lineNum = 0;

    let groupArr = [];
    let groupTypeArr = [];

    export let data;
    $: data, setData();

    function setData() {
        allData = data.allData;
        allCount = data.allCount;

        groupArr = Object.values(
            allData.reduce((acc, curr) => {
                // 그룹이 이미 존재하는지 확인
                if (!acc[curr.st_group]) {
                    acc[curr.st_group] = { st_group: curr.st_group, count: 0 };
                }
                // 해당 그룹의 카운트 증가
                acc[curr.st_group].count += 1;
                return acc;
            }, {}),
        );
    }

    async function updateGroupInfo() {
        const group = groupArr[this.value];
        const groupType = groupTypeArr[this.value];
        if (!groupType) {
            alert("항목을 선택 해주세요");
            return false;
        }

        try {
            const res = await axios.post(
                `${back_api}/traffic_work/update_group`,
                {
                    groupType,
                    group: group.st_group,
                },
            );

            if (res.data.status) {
                invalidateAll();
                groupTypeArr = [];
                alert("그룹 정보가 변경되었습니다.");
            }
        } catch (error) {}
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
                    `${back_api}/traffic_work/update_traffic_plz`,
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
                    `${back_api}/traffic_work/delete_traffic_plz`,
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
</script>

<ModalCustom bind:open={addManyRowModalBool} width="800">
    <div>
        <div>여러 행 추가!</div>
        <div>
            <textarea
                class="w-full rounded-md border-gray-300"
                rows="10"
                bind:value={manyRow}
            ></textarea>
        </div>
    </div>
    <div class="mt-5 text-center">
        <button
            class="py-1.5 w-2/3 bg-green-500 active:bg-green-600 text-white rounded-md"
            on:click={async () => {
                const manyRowArr = manyRow.split("\n");
                console.log(manyRowArr);
                const formattedManyRowData = manyRowArr.map((item) => {
                    const [
                        st_subject,
                        st_link,
                        st_same_link,
                        st_group,
                        st_target_click_count,
                    ] = item.split("\t");
                    return {
                        st_subject,
                        st_link,
                        st_same_link: st_same_link ? true : false,
                        st_group,
                        st_target_click_count: st_target_click_count
                            ? st_target_click_count
                            : 0,
                    };
                });

                try {
                    const res = await axios.post(
                        `${back_api}/traffic_work/add_many_row_traffic_plz`,
                        { formattedManyRowData },
                    );
                    if (res.data.status) {
                        manyRow = {};
                        addManyRowModalBool = false;
                        invalidateAll();
                    }
                } catch (error) {}
            }}
        >
            업데이트
        </button>
    </div>
</ModalCustom>

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
                        `${back_api}/traffic_work/add_row_traffic_plz`,
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

        <button
            type="button"
            class="px-5 py-1 rounded-md bg-yellow-500 active:bg-yellow-600 text-white"
            on:click={() => {
                addManyRowModalBool = true;
            }}
        >
            여러 행 추가
        </button>

        <button
            type="button"
            class="px-5 py-1 rounded-md bg-pink-500 active:bg-pink-600 text-white"
            on:click={async () => {
                try {
                    const res = await axios.get(
                        `${back_api}/traffic_work/reset_now_click`,
                    );
                    if (res.data.status) {
                        alert("현재 클릭 초기화 완료!");
                        invalidateAll();
                    }
                } catch (error) {}
            }}
        >
            현재클릭 삭제
        </button>

        <button> </button>
    </div>
</form>

<div class="my-3 p-2 text-sm rounded-md border">
    <!-- <div class="grid grid-cols-2">
        {#each groupArr as group, idx}
            {#if group.st_group}
                <div class="flex items-center gap-4 mb-2">
                    <div>
                        <span>그룹 {group.st_group}</span>
                    </div>
                    <div>
                        <select
                            class="text-xs py-1 focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                            bind:value={groupTypeArr[idx]}
                        >
                            <option value="">선택</option>
                            <option value="pc">PC</option>
                            <option value="mobile">모바일</option>
                        </select>
                    </div>
                    <div>
                        <button
                            class=" bg-blue-500 py-1 px-5 rounded-lg text-white text-xs"
                            value={idx}
                            on:click={updateGroupInfo}
                        >
                            적용
                        </button>
                    </div>
                </div>
            {/if}
        {/each}
    </div> -->
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
                <th class="border py-2"> 노출수 </th>
                <th class="border py-2"> 목표클릭 </th>
                <th class="border py-2"> 현재클릭 </th>
                <th class="border py-2"> 그룹 </th>
                <th class="border py-2 w-12"> 사용 </th>
                <th class="border py-2 w-12"> 카페 </th>
                <th class="border py-2 w-12"> 일치 </th>
                <th class="border py-2 w-12"> 상태 </th>
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
                            bind:value={allData[idx]["st_expose_count"]}
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

                    <!-- <td class="border p-1.5">
                        <select
                            bind:value={allData[idx]["st_work_type"]}
                            class="text-xs focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                            style="padding: 5px 35px 5px 5px;"
                        >
                            <option value="mobile">모바일</option>
                            <option value="pc">PC</option>
                        </select>
                    </td> -->
                    <td class="border p-1.5 w-16">
                        <input
                            type="text"
                            class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                            bind:value={allData[idx]["st_group"]}
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
                                bind:checked={allData[idx]["st_cafe_work"]}
                            />
                        </div>
                    </td>

                    <td class="border p-1.5">
                        <div class="text-center flex justify-center pl-2">
                            <Toggle
                                size="small"
                                bind:checked={allData[idx]["st_same_link"]}
                            />
                        </div>
                    </td>

                    <td class="border p-1.5">
                        <div class="text-center flex justify-center pl-2">
                            <Toggle
                                size="small"
                                bind:checked={allData[idx]["st_click_status"]}
                            />
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
