<script>
    import { Checkbox, Img, Toggle } from "flowbite-svelte";
    import { goto, invalidateAll } from "$app/navigation";
    import axios from "axios";
    import { back_api } from "$src/lib/const";
    import ModalCustom from "$lib/components/design/ModalCustom.svelte";

    let formArea;
    let preKeywordInsertValue = "";
    let chkedList = [];
    let allChecked = false;
    let allData = [];
    let keywordCount = 0;

    let modalStatus = false;
    let mayny_keywords_val = "";

    export let data;
    $: data, setData();

    function setData() {
        allData = data.allData;
        keywordCount = allData.length;
    }

    async function uaFormAct(e) {
        e.preventDefault();
        const action = e.submitter.value;

        if (action == "upload") {
            // ★ 업로드!! 새로 올릴때!!!!!!!!!!!!!!
            if (!preKeywordInsertValue) {
                alert("키워드 값이 입력되지 않았습니다.");
                return false;
            }

            try {
                const res = await axios.post(`${back_api}/adm/keyword_upload`, {
                    preKeywordInsertValue,
                });
                if (res.data.status) {
                    alert("업로드가 완료 되었습니다.");
                    invalidateAll();
                    preKeywordInsertValue = "";
                } else {
                    alert("업로드 중 에러 발생 했습니다! 중복되면 안됨!!");
                }
            } catch (error) {
                alert("업로드 중 알수없는 에러 발생!!!");
            }
        } else if (action == "update") {
            console.log(chkedList);
            // ★ 업데이트를 하는 부분이니까 업데이트!!!!!!!!!!!!!
            let updateList = chkedList.map((index) => allData[index]);
            console.log(updateList);
            try {
                const res = await axios.post(`${back_api}/adm/keyword_update`, {
                    updateList,
                });

                if (res.data.status) {
                    invalidateAll();
                    chkedList = [];
                    allChecked = false;
                    alert("업데이트가 완료 되었습니다.");
                } else {
                    alert("에러가 발생 했습니다.");
                }
            } catch (error) {
                alert("알수 없는 에러 발생!!!");
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
            let deleteList = chkedList.map((index) => allData[index]["pk_id"]);

            console.log("del 작업!!!!!!!!!!!!!");
            console.log(deleteList);
            try {
                const res = await axios.post(`${back_api}/adm/keyword_delete`, {
                    deleteList,
                });
                if (res.data.status) {
                    invalidateAll();
                    chkedList = [];
                    allChecked = false;
                    alert("삭제가 완료 되었습니다.");
                }
            } catch (error) {}
        }
    }

    async function upload_many_keywords() {
        let mayny_keywords_arr = mayny_keywords_val.split("\n");
        try {
            const res = await axios.post(
                `${back_api}/adm/many_keywords_uploads`,
                {
                    mayny_keywords_arr,
                },
            );
            if (res.status == 200) {
                let faildMessage = "";
                if (res.data.faild_count > 0) {
                    faildMessage = `중복되는 ${res.data.faild_count}개의 키워드는 업데이트 되지 않았습니다.`;
                }
                invalidateAll();
                mayny_keywords_val = "";
                alert(`업로드가 완료 되었습니다. ${faildMessage}`);
            } else {
                alert("업로드 중 에러 발생!!!");
            }
        } catch (error) {}
    }
</script>

<ModalCustom bind:open={modalStatus}>
    <div>
        <div class="mb-3">여러행 추가!!</div>
        <div>
            <textarea
                class="w-full border-gray-300 rounded-md"
                rows="10"
                bind:value={mayny_keywords_val}
            ></textarea>
        </div>
        <div>
            <button
                class="px-3 py-1 bg-blue-500 active:bg-blue-600 text-white rounded-md"
                on:click={upload_many_keywords}
            >
                업로드
            </button>
        </div>
    </div>
</ModalCustom>

<form on:submit={uaFormAct} bind:this={formArea}>
    <div class="flex items-center gap-2">
        <span class="mr-3">
            키워드 갯수 : {keywordCount}
        </span>

        <input
            type="text"
            class="px-2 p-0.5 rounded-sm text-sm"
            bind:value={preKeywordInsertValue}
        />
        <button
            value="upload"
            class="px-5 py-1 rounded-md bg-blue-500 active:bg-blue-600 text-white"
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
            class="px-5 py-1 rounded-md bg-orange-500 active:bg-orange-600 text-white"
            on:click={() => {
                modalStatus = !modalStatus;
            }}
        >
            여러 행 추가
        </button>
    </div>
</form>

<div class="w-full min-w-[800px] overflow-auto mt-5">
    <div class="w-full max-w-[1200px]">
        <table class="w-full text-center">
            <tr>
                <th class="border py-2 w-[70px]">
                    <div class="flex justify-center pl-2">
                        <Checkbox value="allchk" bind:checked={allChecked} />
                    </div>
                </th>
                <th class="border py-2 w-[100px]"> 사용 </th>
                <th class="border py-2"> 키워드 </th>
                <th class="border py-2"> 그룹 </th>
            </tr>

            {#each allData as data, idx}
                <tr>
                    <td class="border">
                        <div class="flex justify-center pl-2">
                            <Checkbox value={idx} bind:group={chkedList} />
                        </div>
                    </td>
                    <td class="border py-2">
                        <div class="flex justify-center pl-2">
                            <Toggle
                                size="small"
                                bind:checked={allData[idx]["pk_use"]}
                            />
                        </div>
                    </td>
                    <td class="border p-1">
                        <input
                            type="text"
                            class="w-full border-gray-200 rounded-md text-xs"
                            bind:value={allData[idx]["pk_content"]}
                        />
                    </td>
                    <td class="border p-1.5 w-48">
                        <input
                            type="text"
                            class="w-full border-gray-200 rounded-md text-sm"
                            bind:value={allData[idx]["pk_group"]}
                        />
                    </td>
                </tr>
            {/each}
        </table>
    </div>
</div>
