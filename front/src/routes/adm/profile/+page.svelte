<script>
    import axios from "axios";
    import { back_api } from "$lib/const";
    import { goto, invalidate, invalidateAll } from "$app/navigation";
    import moment from "moment-timezone";

    const profileWorkStatusList = [
        { value: "active", name: "실제 작업" },
        { value: "ready", name: "준비작업" },
    ];

    let chkId;
    let startNum;
    let endNum;

    let allData = [];
    let profiles = [];
    let selectedId = "";

    let checkedList = [];
    let allChecked = false;

    export let data;
    $: data, setData();

    function setData() {
        allData = data.profile_list;
        profiles = data.profiles;
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

    async function deleteProfile() {
        if (
            !confirm(
                "삭제된 자료는 복구 불가합니다. 진행하시겠습니까? (삭제된 프로필은 수동으로 삭제 해야합니다.)",
            )
        ) {
            return;
        }

        let deleteList = checkedList.map((ele) => ele["pl_id"]);
        const res = await axios.post(
            `${back_api}/traffic_work/delte_profile_row`,
            {
                deleteList,
            },
        );

        if (res.data.status) {
            alert("삭제가 완료 되었습니다.");
            invalidateAll();
        }
    }

    async function updateProfile() {
        console.log(checkedList);

        const res = await axios.post(
            `${back_api}/traffic_work/update_profile_row`,
            {
                checkedList,
            },
        );

        if (res.data.status) {
            alert("업데이트가 완료 되었습니다.");
            checkedList = [];
            invalidateAll();
        } else {
            alert("에러가 발생 했습니다. 다시 시도해주세요");
        }
        // console.log(updateList);
    }

    async function profilesUpdate() {
        console.log(profiles);
        const res = await axios.post(
            `${back_api}/traffic_work/update_profiles`,
            { profiles },
        );
    }

    async function resetProfileStatus() {
        console.log(this.value);
        const pr_name = this.value;
        try {
            const res = await axios.post(
                `${back_api}/traffic_work/reset_profile_status`,
                { pr_name },
            );

            console.log(res);

            if (res.data.status) {
                alert("프로필 상태 초기화가 완료 되었습니다.");
                invalidateAll();
            }
        } catch (error) {}
    }

    async function resetCount() {
        console.log(this.value);
        const pr_name = this.value;
        try {
            const res = await axios.post(
                `${back_api}/traffic_work/reset_count`,
                { pr_name },
            );

            console.log(res);

            if (res.data.status) {
                alert("작업 횟수 초기화가 완료 되었습니다.");
                invalidateAll();
            }
        } catch (error) {}
    }

    async function resetTime() {
        console.log(this.value);
        const pr_name = this.value;
        try {
            const res = await axios.post(
                `${back_api}/traffic_work/reset_time`,
                { pr_name },
            );

            console.log(res);

            if (res.data.status) {
                alert("작업 시간 초기화가 완료 되었습니다.");
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
        {#each profiles as profile}
            <option value={profile.pr_name}>{profile.pr_name}</option>
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

    <button
        class="bg-red-500 active:bg-red-600 py-1 px-3 rounded-md text-white"
        on:click={deleteProfile}
    >
        삭제
    </button>

    <button
        class="bg-green-500 active:bg-green-600 py-1 px-3 rounded-md text-white"
        on:click={updateProfile}
    >
        업데이트
    </button>
</div>

<div class="w-full min-w-[800px] overflow-auto mb-5">
    <div class="w-full max-w-[1200px]">
        <table class="w-full text-center">
            <tr>
                <th class="border py-2">아이디</th>
                <th class="border py-2 text-xs">전체/사용/미사용</th>
                <th class="border py-2">작업방식</th>
                <th class="border py-2">작업타입</th>
                <!-- <th class="border py-2">리셋 여부</th> -->
                <th class="border py-2">그룹</th>
                <th class="border py-2"> 초기화 버튼 </th>
            </tr>
            {#each profiles as profile, idx}
                <tr>
                    <td class="border py-2">{profiles[idx]["pr_name"]}</td>
                    <td class="border py-2"
                        >{profiles[idx]["all"]}/
                        {profiles[idx]["trueCount"]}/
                        {profiles[idx]["all"] - profiles[idx]["trueCount"]}
                    </td>
                    <td class="border py-2">
                        <select
                            class="py-1 px-3 text-xs border-gray-400 rounded-md"
                            bind:value={profiles[idx]["pr_work_status"]}
                        >
                            {#each profileWorkStatusList as profileWorkStatus}
                                <option
                                    value={profileWorkStatus.value}
                                    checked={profileWorkStatus.value ==
                                        profiles[idx]["pr_work_status"]}
                                >
                                    {profileWorkStatus.name}
                                </option>
                            {/each}
                        </select>
                    </td>
                    <td class="border py-2">
                        <select
                            class="py-1 px-3 text-xs border-gray-400 rounded-md"
                            bind:value={profiles[idx]["pr_work_type"]}
                        >
                            <option value="pc">PC</option>
                            <option value="mobile">모바일</option>
                        </select>
                    </td>
                    <!-- <td class="border py-2">
                        <label class="toggle-switch">
                            <input
                                type="checkbox"
                                bind:checked={profiles[idx]["pr_reset_status"]}
                            />
                            <span class="toggle-slider"></span>
                        </label>
                    </td> -->

                    <td class="border py-2 w-24 p-1">
                        <input
                            type="text"
                            class="p-1 text-sm border-gray-400 rounded-md w-16"
                            bind:value={profiles[idx]["pr_group"]}
                        />
                    </td>

                    <td class="border py-2">
                        <button
                            class="py-1 px-3 bg-blue-500 active:bg-blue-600 text-white text-xs rounded-md"
                            value={profile.pr_name}
                            on:click={resetProfileStatus}
                        >
                            작업
                        </button>

                        <button
                            class="py-1 px-3 bg-green-500 active:bg-green-600 text-white text-xs rounded-md"
                            value={profile.pr_name}
                            on:click={resetCount}
                        >
                            횟수
                        </button>

                        <button
                            class="py-1 px-3 bg-purple-500 active:bg-purple-600 text-white text-xs rounded-md"
                            value={profile.pr_name}
                            on:click={resetTime}
                        >
                            시간
                        </button>
                    </td>
                </tr>
            {/each}
        </table>
    </div>

    <div class="text-xs mt-1">
        <p>
            ※ 초기화는 일단 하지 말자 테스트 성공하면 업데이트 하기 (코딩은 다
            됨)
        </p>
        <p>※ 실제 작업은 준비 작업이 3번 이루어진 상태에서 진행 해보기</p>
    </div>

    <div class="mt-3">
        <button
            class="bg-green-500 active:bg-green-600 py-1 px-3 rounded-md text-white"
            on:click={profilesUpdate}
        >
            설정 적용하기
        </button>
    </div>
</div>

<!-- devide!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->

<div class="w-full min-w-[800px] overflow-auto">
    <div class="w-full max-w-[1200px]">
        <table class="w-full text-center">
            <tr>
                <th
                    class="border py-2"
                    on:click={(e) => {
                        const nowEle = e.target;
                        const children = nowEle.children;
                        if (children[0]) {
                            children[0].checked = !children[0].checked;
                        }
                    }}
                >
                    <input
                        type="checkbox"
                        on:change={(e) => {
                            console.log(allData);
                            if (e.target.checked == true) {
                                checkedList = allData;
                            } else {
                                checkedList = [];
                            }
                        }}
                        class="border-gray-300 rounded-sm"
                    />
                </th>
                <th class="border py-2">아이디</th>
                <th class="border py-2">번호</th>
                <th class="border py-2">UA</th>
                <th class="border py-2">작업 여부</th>
                <th class="border py-2">작업 횟수</th>
                <th class="border py-2">마지막 작업 시간</th>
            </tr>

            {#each allData as data, idx}
                <tr>
                    <td
                        class="border py-2 w-12"
                        on:click={(e) => {
                            const nowEle = e.target;
                            const children = nowEle.children;
                            if (children[0]) {
                                children[0].checked = !children[0].checked;
                            }
                        }}
                    >
                        <input
                            type="checkbox"
                            value={allData[idx]}
                            bind:group={checkedList}
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
                        <label class="toggle-switch">
                            <input
                                type="checkbox"
                                bind:checked={data.pl_work_status}
                            />
                            <span class="toggle-slider"></span>
                        </label>
                    </td>
                    <td class="border py-2">
                        {data.pl_work_count}
                    </td>
                    <td class="border py-2">
                        {#if data.pl_lastworked_at}
                            {moment(data.pl_lastworked_at).format(
                                "YY-MM-DD HH:mm:ss",
                            )}
                        {/if}
                    </td>
                </tr>
            {/each}
        </table>
    </div>
</div>
