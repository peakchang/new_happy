<script>
    import ModalCustom from "$lib/components/design/ModalCustom.svelte";
    import { Checkbox, Img, Toggle } from "flowbite-svelte";
    import { goto, invalidateAll } from "$app/navigation";
    import axios from "axios";
    import { back_api } from "$src/lib/const";
    import moment from "moment";

    let formArea;
    let userAgentInsertValue = "";
    let chkedList = [];
    let allChecked = false;
    let allData = [];
    let trafficAddModalBool = false; // 작업내용 추가시 필요한 모달
    let addManyRowModalBool = false; // 여러 행 추가시~~
    let rateChkModalBool = false; // 등수 변동 체크 모달

    let rateArr = [];

    let manyRow = "";

    let addTrafficValues = {};
    let memoModalBool = false; // 메모 내용 확인 및 추가시 필요한 모달
    let getStId = ""; // 메모 내용 모달 오픈시 해당 버튼의 value 값을 담기 위함
    let memoType = "";
    let allCount = 0;
    let lineNum = 0;

    let reserchSelectVal = "";

    let groupArr = [];
    let groupTypeArr = [];

    let getRateIdx = 0;

    export let data;
    $: data, setData();

    async function showRate() {
        console.log(this.value);
        rateChkModalBool = true;

        try {
            const res = await axios.post(
                `${back_api}/traffic_work/load_rate_history`,
                { sr_site_id: this.value },
            );
            console.log(res.data);

            rateArr = res.data.site_rate_history;
            console.log(rateArr);
        } catch (error) {}
    }

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

        console.log(groupArr);
    }

    async function uaFormAct(e) {
        e.preventDefault();
        const action = e.submitter.value;
        console.log(action);

        if (action == "update") {
            console.log("여기지?");

            if (chkedList.length == 0) {
                alert("업데이트 할 항목을 선택해주세요");
                return false;
            }
            // ★ 업데이트를 하는 부분이니까 업데이트!!!!!!!!!!!!!
            let updateList = chkedList.map((index) => allData[index]);

            console.log(updateList);

            try {
                const res = await axios.post(
                    `${back_api}/traffic_work/update_traffic_work`,
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
            } catch (err) {
                console.log("에러얌!");
                console.error(err.message);
            }
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
                    `${back_api}/traffic_work/delete_traffic_work`,
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

    function reserchList() {
        console.log(reserchSelectVal);
        if (!reserchSelectVal) {
            alert("그룹을 선택 하세요");
            return false;
        }
        goto(`?group=${reserchSelectVal}`);
    }

    function rateChk(new_rate, previous_rate) {
        // "1/5" → [1,5]
        if (!new_rate || !previous_rate) return ""; // 값이 없을 경우
        const [newPage, newRank] = new_rate.split("/").map(Number);
        const [prevPage, prevRank] = previous_rate.split("/").map(Number);

        if (newPage > prevPage)
            return '<span class="text-red-500"><i class="fa fa-caret-square-o-up" aria-hidden="true"></i></span>';
        if (newPage < prevPage)
            return '<span class="text-blue-500"><i class="fa fa-caret-square-o-down" aria-hidden="true"></i></span>';

        // 페이지가 같으면 등수 비교
        if (newRank > prevRank)
            return '<span class="text-red-500"><i class="fa fa-caret-square-o-up" aria-hidden="true"></i></span>';
        if (newRank < prevRank)
            return '<span class="text-blue-500"><i class="fa fa-caret-square-o-down" aria-hidden="true"></i></span>';

        return '<span class="text-green-500"><i class="fa fa-minus-square" aria-hidden="true"></i></span>'; // 완전히 동일할 경우
    }
</script>

<ModalCustom bind:open={rateChkModalBool} width="800">
    <div class="mb-5">
        <div>등수 기록 확인!!</div>
    </div>

    <div class=" max-h-[500px] overflow-auto">
        <table class="w-full">
            <tbody>
                <tr>
                    <th class="border py-1">순위</th>
                    <th class="border py-1">날짜</th>
                </tr>

                {#each rateArr as rate}
                    <tr class="text-center text-sm">
                        <td class="border py-1 w-1/2">
                            {rate.sr_rate}
                        </td>
                        <td class="border py-1 w-1/2">
                            {moment(rate.sr_created_at).format(
                                "YY-MM-DD HH:mm",
                            )}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</ModalCustom>

<ModalCustom bind:open={addManyRowModalBool} width="800">
    <div>
        <div>여러 행 추가! <span class="text-sm">(링크,키워드)</span></div>
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
                    const [st_link, st_subject] = item.split(",");
                    return {
                        st_link,
                        st_subject,
                    };
                });

                try {
                    const res = await axios.post(
                        `${back_api}/traffic_work/add_many_row_traffic_plz`,
                        { formattedManyRowData },
                    );
                    if (res.data.status) {
                        manyRow = "";
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
            </tr>
        </table>
    </div>
    <div class="mt-5 text-center">
        <button
            class="py-1.5 w-2/3 bg-green-500 active:bg-green-600 text-white rounded-md"
            on:click={async () => {
                try {
                    const res = await axios.post(
                        `${back_api}/traffic_work/add_row_traffic_work`,
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

        <select
            class="p-1.5 text-xs border-gray-300 rounded-lg"
            bind:value={reserchSelectVal}
        >
            {#each groupArr as group}
                <option value={group.st_group}>그룹 : {group.st_group}</option>
            {/each}
        </select>
        <button
            type="button"
            class="px-5 py-1 rounded-md bg-purple-400 active:bg-purple-500 text-white"
            on:click={reserchList}
        >
            조회
        </button>
        <button
            type="button"
            class="px-5 py-1 rounded-md bg-purple-400 active:bg-purple-500 text-white"
            on:click={() => {
                goto("/adm/traffic");
            }}
        >
            그룹 초기화
        </button>
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
        <div class="mb-3 text-xs">
            ※ 노출 여부는 실제 클릭 작업 X / 노출 확인 작업만 하는것 // 노출
            상태는 노출 작업 유무를 나타냄!!
        </div>

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
                <th class="border py-2"> 노출수 </th>
                <th class="border py-2"> 목표클릭 </th>
                <th class="border py-2"> 현재클릭 </th>
                <th class="border py-2"> 그룹 </th>
                <th class="border py-2 w-12"> 사용 </th>

                <th class="border py-2 w-12"> 일치 </th>
                <th class="border py-2 w-12"> 노출여부 </th>
                <th class="border py-2 w-12"> 노출상태 </th>
                <th class="border py-2 w-12 text-[10px]">
                    PC클릭상태<br />
                </th>
                <th class="border py-2 w-12 text-[10px]">
                    m클릭상태<br />
                </th>
                <th class="border py-2 w-12 text-[10px]"> 현재순위 </th>
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
                                bind:checked={allData[idx]["st_same_link"]}
                            />
                        </div>
                    </td>

                    <td class="border p-1.5">
                        <div class="text-center flex justify-center pl-2">
                            <Toggle
                                size="small"
                                bind:checked={allData[idx]["st_expose_bool"]}
                            />
                        </div>
                    </td>

                    <td class="border p-1.5">
                        <div class="text-center flex justify-center pl-2">
                            <Toggle
                                size="small"
                                bind:checked={allData[idx]["st_expose_status"]}
                            />
                        </div>
                    </td>

                    <td class="border p-1.5">
                        <div class="text-center flex justify-center pl-2">
                            <Toggle
                                size="small"
                                bind:checked={
                                    allData[idx]["st_pc_click_status"]
                                }
                            />
                        </div>
                    </td>

                    <td class="border p-1.5">
                        <div class="text-center flex justify-center pl-2">
                            <Toggle
                                size="small"
                                bind:checked={allData[idx]["st_m_click_status"]}
                            />
                        </div>
                    </td>

                    <td class="border p-1.5 w-20">
                        <div class="flex items-center justify-center gap-1.5">
                            <span class="">
                                {data.sr_rate1
                                    ? data.sr_rate1.replace("/", "P / ")
                                    : "없음"}
                            </span>
                            <span class="">
                                {@html rateChk(data.sr_rate2, data.sr_rate1)}
                            </span>
                        </div>

                        <div>
                            <button
                                class="text-xs px-2 py-1 bg-blue-400 text-white rounded-md"
                                value={data.st_id}
                                on:click={showRate}
                            >
                                기록보기
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
