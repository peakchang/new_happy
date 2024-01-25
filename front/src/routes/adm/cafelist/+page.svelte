<script>
    import ModalCustom from "$lib/components/design/ModalCustom.svelte";

    import { Checkbox, Toggle } from "flowbite-svelte";

    import { goto, invalidateAll } from "$app/navigation";
    import { updateNewCafe, updateCafeList, deleteCafeList } from "./func";
    let cafeAddModalBool = false; // 카페 추가 modal 열고 닫기
    let addCafeLink = ""; // 추가할 게시판 주소
    let addCafeName = ""; // 추가할 게시판 이름
    let addCafeNum = ""; // 추가할 게시판 번호
    let cafeList = [];
    let allChk = false;
    let checkedList = [];

    export let data;

    $: data, setData();
    function setData() {
        cafeList = data.cafe_list;
        console.log(cafeList);
    }

    function allchkFunc() {
        console.log(this.value);
        if (this.value == "allchk" && this.checked) {
            checkedList = Array.from(
                { length: cafeList.length },
                (_, index) => index,
            );
        } else if (this.value == "allchk" && !this.checked) {
            checkedList = [];
        }
        if (checkedList.length == cafeList.length) {
            allChk = true;
        } else {
            allChk = false;
        }
    }
</script>

<ModalCustom bind:open={cafeAddModalBool}>
    <div>
        <label>
            카페 주소 :
            <input
                type="text"
                class="py-1 rounded-md border-gray-300 focus:ring-0 w-full"
                bind:value={addCafeLink}
            />
        </label>
        <label>
            <div class="mt-5">
                <span class="">게시판명 : </span>

                <input
                    type="text"
                    class="py-1 rounded-md border-gray-300 focus:ring-0 w-full"
                    bind:value={addCafeName}
                />
            </div>
        </label>

        <label>
            <div class="mt-5">
                <span class="">게시판번호 : </span>

                <input
                    type="text"
                    class="py-1 rounded-md border-gray-300 focus:ring-0 w-full"
                    bind:value={addCafeNum}
                />
            </div>
        </label>
    </div>
    <div class="mt-5 text-center">
        <button
            class="py-1.5 w-2/3 bg-green-500 active:bg-green-600 text-white rounded-md"
            on:click={async (event) => {
                const result = await updateNewCafe(
                    event,
                    addCafeLink,
                    addCafeName,
                    addCafeNum,
                );
                console.log(result);

                if (result.status) {
                    alert(result.message);
                    invalidateAll();
                    addCafeLink = "";
                    addCafeName = "";
                    addCafeNum = "";
                    cafeAddModalBool = false;
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
            cafeAddModalBool = !cafeAddModalBool;
        }}
        class="bg-green-500 active:bg-green-600 py-1 px-4 rounded-md text-white mr-2"
    >
        카페 추가
    </button>

    <button
        class="bg-blue-500 active:bg-blue-600 py-1 px-4 rounded-md text-white mr-2"
        on:click={async (e) => {
            const result = await updateCafeList(e, checkedList, cafeList);
            if (result) {
                alert("업데이트가 완료 되었습니다.");
                checkedList = [];
                allChk = false;
                invalidateAll();
            }
        }}
    >
        선택 업데이트
    </button>

    <button
        class="bg-red-500 active:bg-red-600 py-1 px-4 rounded-md text-white"
        on:click={async (e) => {
            const result = await deleteCafeList(e, checkedList, cafeList);
            if (result) {
                alert("삭제가 완료 되었습니다.");
                checkedList = [];
                allChk = false;
                invalidateAll();
            }
        }}
    >
        선택 삭제
    </button>
</div>

<div class="w-full overflow-auto">
    <div class="w-full min-w-[800px]">
        <table class="w-full text-center">
            <tr>
                <th class="border py-2">
                    <div class="flex justify-center pl-2">
                        <Checkbox
                            value="allchk"
                            bind:checked={allChk}
                            on:change={allchkFunc}
                        />
                    </div>
                </th>
                <th class="border py-2"> 카페 주소 </th>
                <th class="border py-2"> 게시판 </th>
                <th class="border py-2"> 게시판 번호 </th>
                <th class="border py-2"> 사용 여부 </th>
                <th class="border py-2"> 가입 조건 </th>
            </tr>

            {#each cafeList as cafe, idx}
                <tr>
                    <td class="border p-1">
                        <div class="flex justify-center pl-2">
                            <Checkbox
                                value={idx}
                                bind:group={checkedList}
                                on:change={allchkFunc}
                            />
                        </div>
                    </td>
                    <td class="border p-1.5">
                        {cafe.cl_link}
                    </td>
                    <td class="border p-1.5">
                        <input
                            type="text"
                            class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                            bind:value={cafeList[idx]["cl_board_name"]}
                        />
                    </td>
                    <td class="border p-1.5 w-24">
                        <input
                            type="text"
                            class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                            bind:value={cafeList[idx]["cl_board_num"]}
                        />
                    </td>
                    <td class="border p-1">
                        <div class="text-center flex justify-center pl-2">
                            <Toggle
                                size="small"
                                bind:checked={cafeList[idx]["cl_use"]}
                            />
                        </div>
                    </td>
                    <td class="border p-1.5">
                        <input
                            type="text"
                            class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                            bind:value={cafeList[idx]["cl_memo"]}
                        />
                    </td>
                </tr>
            {/each}
        </table>
    </div>
</div>
