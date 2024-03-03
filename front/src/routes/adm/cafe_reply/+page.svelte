<script>
    import { back_api } from "$src/lib/const";
    import axios from "axios";
    import { goto, invalidateAll } from "$app/navigation";

    export let data;

    $: data, setData();

    let cafeReplyList = [];
    let addReply = "";
    let allChecked = false;
    let checkedList = [];

    function setData() {
        cafeReplyList = data.cafe_reply_list;
        console.log(cafeReplyList);
    }

    async function addReplyFunc() {
        if (!addReply) {
            alert("댓글을 입력해주세요");
            return;
        }

        try {
            const res = await axios.post(
                `${back_api}/cafe_work/add_cafe_reply`,
                { addReply },
            );
            console.log(res);
            if (res.data.status) {
                addReply = "";
                invalidateAll();
                alert("업로드가 완료 되었습니다.");
            }
        } catch (error) {
            alert('에러가 발생했습니다. 다시 시도해주세요!')
        }
    }

    async function deleteReplyFunc() {
        if (checkedList.length == 0) {
            alert("삭제할 항목을 선택해주세요");
            return;
        }
        if (!confirm("삭제한 항목은 복구가 불가능합니다. 진행하시겠습니까?")) {
            return;
        }

        try {
            const res = await axios.post(
                `${back_api}/cafe_work/delete_cafe_reply`,
                { checkedList },
            );

            if (res.data.status) {
                checkedList = [];
                allChecked = false;
                invalidateAll();
                alert("삭제가 완료 되었습니다.");
            }
        } catch (error) {
            alert('에러가 발생했습니다. 다시 시도해주세요!')
        }
    }
</script>

<div class="flex justify-center items-center gap-2 mb-5">
    <form
        class="flex justify-center items-center gap-2"
        on:submit={addReplyFunc}
    >
        <input
            type="text"
            bind:value={addReply}
            class="w-96 border border-gray-300 py-1 px-3 rounded-md focus:ring-0"
        />
        <button
            class="py-1.5 px-2 bg-blue-500 active:bg-blue-600 rounded-md text-white"
        >
            댓글 추가
        </button>
    </form>

    <button
        class="py-1.5 px-2 bg-red-500 active:bg-red-600 rounded-md text-white"
        on:click={deleteReplyFunc}
    >
        선택 삭제
    </button>
</div>

<div>
    <table class="w-full">
        <tr>
            <th class="border p-2 w-12">
                <input
                    type="checkbox"
                    bind:checked={allChecked}
                    on:change={() => {
                        console.log(allChecked);
                        if (allChecked) {
                            let tempArr = [];
                            for (let i = 0; i < cafeReplyList.length; i++) {
                                const data = cafeReplyList[i];
                                console.log(data);
                                tempArr.push(data.cr_id);
                            }
                            checkedList = tempArr;
                        } else {
                            checkedList = [];
                        }
                    }}
                    class="w-4 h-4 text-blue-600 focus:ring-0 bg-gray-100 border-gray-300 rounded dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                />
            </th>
            <th class="border">댓글 내용</th>
        </tr>

        {#each cafeReplyList as cafeReply}
            <tr>
                <td class="border p-2 w-12 text-center">
                    <input
                        type="checkbox"
                        value={cafeReply.cr_id}
                        bind:group={checkedList}
                        on:change={() => {
                            if (checkedList.length != cafeReplyList.length) {
                                allChecked = false;
                            } else {
                                allChecked = true;
                            }
                        }}
                        class="w-4 h-4 text-blue-600 focus:ring-0 bg-gray-100 border-gray-300 rounded dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                    />
                </td>
                <td class="border p-2">
                    {cafeReply.cr_content}
                </td>
            </tr>
        {/each}
    </table>
</div>
