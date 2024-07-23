<script>
    import axios from "axios";
    import { back_api } from "$lib/const";
    import { goto, invalidate, invalidateAll } from "$app/navigation";

    let chkId;
    let startNum;
    let endNum;

    let allData = [];
    let profileChkList = [];
    let selectedId = "";

    export let data;
    $: data, setData();

    function setData() {
        allData = data.profile_list;
        profileChkList = data.pl_name_list;
    }

    async function uploadProfile() {
        if (!chkId) {
            alert("아이디를 입력 해주세요");
            return;
        }
        if (!startNum || !endNum) {
            alert("시작 값과 끝 값을 모두 입력 해주세요");
            return;
        }
        const profileArr = Array.from(
            { length: Number(endNum) - Number(startNum) + 1 },
            (_, i) => Number(startNum) + i,
        );

        try {
            const res = await axios.post(
                `${back_api}/adm/upload_profile_list`,
                { profileArr, chkId },
            );
            if (res.data.status) {
                let addMessage = "";
                if (res.data.exceptList.length > 0) {
                    addMessage = `중복되는 리스트 ${res.data.exceptList.join(",")} 는 제외되었습니다.`;
                }
                alert(`업로드가 완료 되었습니다. ${addMessage}`);
                invalidateAll();
            }
        } catch (error) {}
    }
</script>

<div class="mb-5">
    <label>
        <span>아이디 : </span>
        <input
            type="text"
            class="py-1 px-2 border-gray-300 rounded-md focus:border-0 w-28 text-sm"
            bind:value={chkId}
        />
    </label>

    <label>
        <span>시작번호 : </span>
        <input
            type="text"
            class="py-1 px-2 border-gray-300 rounded-md focus:border-0 w-20 text-sm"
            bind:value={startNum}
        />
    </label>

    <label>
        <span>끝번호 : </span>
        <input
            type="text"
            class="py-1 px-2 border-gray-300 rounded-md focus:border-0 w-20 text-sm"
            bind:value={endNum}
        />
    </label>

    <button
        class="ml-3 bg-blue-500 active:bg-blue-600 py-1 px-3 rounded-md text-white"
        on:click={uploadProfile}
    >
        프로필 추가
    </button>

    <select
        class="py-1 px-2 text-sm ml-5 border-gray-300 rounded-md"
        bind:value={selectedId}
    >
        <option value="">전체</option>
        {#each profileChkList as profile}
            <option value={profile.pl_name}>{profile.pl_name}</option>
        {/each}
    </select>
    <button
        class="ml-3 bg-blue-500 active:bg-blue-600 py-1 px-3 rounded-md text-white"
        on:click={() => {
            if (!selectedId) {
                alert("프로필을 선택하세요");
                return;
            }
            goto(`?id=${selectedId}`, { invalidateAll: true });
        }}
    >
        조회
    </button>
</div>

<div class="w-full min-w-[800px] overflow-auto">
    <div class="w-full max-w-[1200px]">
        <table class="w-full text-center">
            <tr>
                <th
                    class="border py-2"
                    on:click={(e) => {
                        const nowEle = e.target;
                        const children = nowEle.children;
                        children[0].checked = !children[0].checked;
                    }}
                >
                    <input type="checkbox" class="border-gray-300 rounded-sm" />
                </th>
                <th class="border py-2">아이디</th>
                <th class="border py-2">번호</th>
                <th class="border py-2">UA</th>
                <th class="border py-2">마지막 작업 시간</th>
            </tr>

            {#each allData as data}
                <tr>
                    <td
                        class="border py-2 w-12"
                        on:click={(e) => {
                            const nowEle = e.target;
                            const children = nowEle.children;
                            children[0].checked = !children[0].checked;
                        }}
                    >
                        <input
                            type="checkbox"
                            class="border-gray-300 rounded-sm"
                        />
                    </td>
                    <td class="border py-2">
                        {data.pl_name}
                    </td>
                    <td class="border py-2">
                        {data.pl_number}
                    </td>
                    <td class="border py-2">
                        {data.pl_ua_num}
                    </td>
                    <td class="border py-2">
                        {data.pl_lastworked_at ? data.pl_lastworked_at : ""}
                    </td>
                </tr>
            {/each}
        </table>
    </div>
</div>
