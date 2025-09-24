<script>
    import { admin_sidebar } from "$src/lib/store";
    import * as XLSX from "xlsx";
    import axios from "axios";
    import {
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
        Checkbox,
        Toggle,
        Modal,
    } from "flowbite-svelte";
    import { back_api } from "$src/lib/const";
    import { goto, invalidateAll } from "$app/navigation";
    import { page } from "$app/stores";

    import {
        setParams,
        deleteParam,
        clearParams,
        getPagination,
    } from "$src/lib/lib";

    import moment from "moment-timezone";
    export let data;

    let selectChk = []; // 체크된 목록
    let allChkVal = false; // 전체 체크 변수 (true면 전체 / false면 전체 해제)

    let pagenation = []; // 페이지네이션~~~
    let nowPage = 1; // 기본 페이지는 1로 잡아줌!!
    let maxPage = data.maxPage;

    let idStr = "";
    let addRowModal = false; // 아이디 추가 modal

    console.log($page);

    let searchVal = $page.url.searchParams.get("base") || "n_use"; // 검색 목록 체크
    let searchIdVal = $page.url.searchParams.get("id")
        ? $page.url.searchParams.get("id")
        : "";

    let nworkList = []; // 전체 리스트 항목~ 업데이트는 여기서 총관리~

    let exCopyBool = false;
    let anyBlogSort = false;

    if (searchVal == "n_use") {
        anyBlogSort = $page.url.searchParams.get("anysort") || true;
    }
    let xBlogSort = false;
    let useComList = [];
    let useComRes = [];

    let fillSortListBool = false;
    let fillSortProfileBool = false;

    $: data, setData(data);

    function setData(data) {
        if (data.page) {
            nowPage = Number(data.page);
        }
        pagenation = getPagination(nowPage, data.maxPage);

        nworkList = data.nworkList;

        console.log(nworkList);

        useComList = data.useComList;

        useComRes = useComList.reduce((acc, current) => {
            const found = acc.find(
                (item) => item.n_use_com === current.n_use_com,
            );
            if (found) {
                found.count++;
            } else {
                acc.push({ n_use_com: current.n_use_com, count: 1 });
            }
            return acc;
        }, []);
    }

    let ex_rows;
    let ex_filename = "엑셀 파일 선택";

    async function getFileEx(e) {
        ex_filename = e.target.files[0].name;
        let reader = new FileReader();
        reader.onload = function () {
            let data = reader.result;
            let workBook = XLSX.read(data, { type: "binary" });
            workBook.SheetNames.forEach(function (sheetName) {
                // let rows = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
                let rows = XLSX.utils.sheet_to_json(workBook.Sheets["Sheet1"]);
                ex_rows = rows;
                console.log(ex_rows);
            });
        };

        reader.readAsBinaryString(e.target.files[0]);
    }

    async function uploadExcel() {
        try {
            const res = await axios.post(`${back_api}/nwork/exupdate`, {
                ex_rows,
            });
            if (res.data.status) {
                alert("업로드가 완료 되었습니다.");
                invalidateAll();
            }
        } catch (error) {}
    }

    function allChk() {
        if (allChkVal) {
            const arr = Array.from({ length: nworkList.length }, (_, i) => i);
            selectChk = arr;
        } else {
            selectChk = [];
        }
    }

    async function setUpdate() {
        let updateList = [];
        for (let i = 0; i < selectChk.length; i++) {
            const num = selectChk[i];
            updateList.push(nworkList[num]);
        }

        try {
            const res = await axios.post(`${back_api}/nwork/row_update`, {
                updateList,
            });
            if (res.data.status == "success") {
                invalidateAll();
                selectChk = [];
                allChkVal = false;
                addRowModal = false;
                alert("업데이트가 완료 되었습니다.");
            }
        } catch (error) {}
    }

    async function setDelete() {
        let deleteList = [];
        if (selectChk.length == 0) {
            alert("삭제할 목록을 선택해주세요");
            return;
        }

        if (!confirm("삭제한 내용은 복구가 불가합니다. 진행하시겠습니까?")) {
            return;
        }
        for (let i = 0; i < selectChk.length; i++) {
            const num = selectChk[i];
            deleteList.push(nworkList[num]);
        }

        try {
            const res = await axios.post(`${back_api}/nwork/delete_row`, {
                deleteList,
            });
            if (res.data.status) {
                invalidateAll();
                selectChk = [];
                allChkVal = false;
                alert("삭제가 완료 되었습니다.");
            }
        } catch (error) {
            alert("요청 실패");
        }
    }

    async function addRow() {
        const idObjs = idStr
            .trim()
            .split("\n")
            .map((line) => {
                const [id, pwd, memo] = line.split("|");
                return { id, pwd, memo };
            });

        try {
            const res = await fetch(`${back_api}/nwork/add_row`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(idObjs),
            });

            if (!res.ok) {
                const errorData = await res.json(); // 서버가 보낸 에러 메시지
                throw new Error(errorData.message || "서버 오류");
            }
            const result = await res.json();
            let addMessage = "";
            if (result.duplicateCount) {
                addMessage = `${result.duplicateCount}건이 중복됩니다.`;
            }
            alert(`업로드 완료! ${addMessage}`);
            invalidateAll();
        } catch (err) {
            console.error("에러 발생:", err.message);
            alert("요청 중 문제가 발생했습니다: " + err.message);
        }
    }

    function searchFunc(e) {
        e.preventDefault();
        console.log("sdlifajsldifj");

        console.log(searchVal);
        console.log(searchIdVal);

        anyBlogSort = false;
        setParams({ base: searchVal, id: searchIdVal }, true);
        getPagination(1, data.maxPage);
    }

    function anyBlogSortFunc() {
        if (this.checked == true) {
            setParams({ anysort: "true" });
        } else {
            deleteParam("anysort");
        }
    }

    function xBlogSortFunc() {
        if (this.checked == true) {
            setParams({ xchk: "true" });
        } else {
            deleteParam("xchk");
        }
    }

    async function sortNumList() {
        const index = selectChk[0];
        const baseValue = nworkList[index];

        console.log(index);
        console.log(baseValue);

        if (fillSortListBool && !baseValue.n_blog_order) {
            alert("순서 기준값이 없습니다.");
            return;
        }

        if (fillSortProfileBool && !baseValue.n_ch_profile) {
            alert("프로필 기준값이 없습니다.");
            return;
        }

        if (!fillSortListBool && !fillSortProfileBool) {
            alert("둘중 하나는 체크 해~");
            return;
        }

        if (selectChk.length > 1) {
            alert("하나만 체크 해야함!");
            return;
        }

        let workArr = [];
        if (index !== -1) {
            const slicedArray = [...nworkList].slice(index);
            workArr = slicedArray.map((item) => item.n_idx);
        } else {
            console.log("Value not found in array.");
        }

        try {
            const res = await axios.post(`${back_api}/nwork/fill_number`, {
                workArr,
                baseValue,
                fillSortListBool,
                fillSortProfileBool,
            });
            if (res.status == 200) {
                if (parseInt(res.data.arrCount) > 0) {
                    alert(`${res.data.arrCount}개의 값이 중복됩니다.`);
                } else {
                    alert("반영 되었습니다.");
                }
                invalidateAll();
            } else {
            }
        } catch (err) {
            alert("에러가 발생 했습니다. 다시 시도해주세요");
            console.error(err.message);
        }

        // nworkList
    }

    async function resetWorkCount() {
        console.log("alsdjfliasjdf");

        let resetList = [];
        for (let i = 0; i < selectChk.length; i++) {
            const num = selectChk[i];
            resetList.push(nworkList[num]);
        }

        console.log(resetList);
        

        try {
            const res = await axios.post(`${back_api}/nwork/reset_count`, {
                resetList,
            });
            if (res.status) {
                invalidateAll();
                selectChk = [];
                allChkVal = false;
                alert("카운트 초기화가 완료 되었습니다.");
            }
        } catch (error) {}

        

    }
</script>

<Modal title="아이디 추가" bind:open={addRowModal} autoclose>
    <div>기준 : 아이디|비번|메모</div>
    <div>
        <textarea
            bind:value={idStr}
            class="border border-gray-300 rounded-md w-full focus:border-blue-300"
            rows="8"
        ></textarea>
    </div>
    <svelte:fragment slot="footer">
        <button
            class="py-1 px-3 bg-blue-500 text-white rounded-lg"
            on:click={addRow}
        >
            업데이트
        </button>
    </svelte:fragment>
</Modal>

<div class="mb-2 flex flex-wrap gap-2 items-center max-w-[1100px]">
    <div class="text-xs md:text-sm">
        <span>전체 : {data.allCount} / 비정상 : {data.errCount}</span>
    </div>

    <div class="text-xs md:text-sm">
        <button
            class=" bg-fuchsia-700 text-white py-1 px-3 rounded-md"
            on:click={() => {
                addRowModal = !addRowModal;
            }}
        >
            아이디 추가
        </button>
    </div>

    <div class="text-xs md:text-sm">
        <button
            class=" bg-green-700 text-white py-1 px-3 rounded-md"
            on:click={setUpdate}
        >
            선택 업데이트
        </button>
    </div>

    <div class="text-xs md:text-sm">
        <button
            class=" bg-red-700 text-white py-1 px-3 rounded-md"
            on:click={setDelete}
        >
            선택 삭제
        </button>
    </div>

    <div class="flex text-xs md:text-sm">
        <label>
            <div class="cursor-pointer px-6 py-1 border mr-1 rounded-lg">
                {ex_filename}
            </div>
            <input type="file" class="hidden" on:change={getFileEx} />
        </label>
        <button
            class=" bg-orange-500 py-1 px-3 rounded-lg text-white"
            on:click={uploadExcel}
        >
            업로드
        </button>
    </div>

    <form on:submit={searchFunc}>
        <div class="flex items-center gap-1.5">
            <div class="text-xs md:text-sm">
                <select
                    bind:value={searchVal}
                    class="py-1 px-5 text-xs rounded-md border-gray-400"
                >
                    <option value="all">전체보기</option>
                    <option value="n_cafe">밴드</option>
                    <option value="n_use">정상 아이디</option>
                    <option value="abnormal">비정상 아이디</option>

                    <!-- <option value="n_blog_work">진행블로그</option>
            <option value="n_blog_standby">대기블로그</option> -->
                    <option value="n_blog_any">막블로그</option>
                </select>
            </div>

            <div class="relative">
                <input
                    type="text"
                    class="p-1 pl-2 text-xs rounded-md border-gray-400 focus:ring-0"
                    placeholder="검색할 아이디"
                    bind:value={searchIdVal}
                />
                <button
                    type="button"
                    class="absolute top-[-1px] right-1 text-lg text-gray-500"
                    on:click={() => {
                        searchIdVal = "";
                    }}
                >
                    <i class="fa fa-times-circle-o" aria-hidden="true"></i>
                </button>
            </div>

            <button class="py-1 px-3 bg-amber-600 rounded-md text-white">
                검색
            </button>
        </div>
    </form>

    exCopy <Toggle size="small" bind:checked={exCopyBool} />
    블로그 정렬 <Toggle
        size="small"
        on:change={anyBlogSortFunc}
        bind:checked={anyBlogSort}
    />

    X체크 <Toggle
        size="small"
        on:change={xBlogSortFunc}
        bind:checked={xBlogSort}
    />

    <button
        class="py-1 px-3 bg-blue-500 active:bg-blue-600 rounded-md text-white"
        on:click={sortNumList}
    >
        기준 내리기
    </button>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex gap-2 border pl-2 py-1 rounded-md">
        <span>순서</span>
        <Checkbox bind:checked={fillSortListBool}></Checkbox>
    </label>

    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex gap-2 border pl-2 py-1 rounded-md">
        <span>프로필</span>
        <Checkbox bind:checked={fillSortProfileBool}></Checkbox>
    </label>

    <button
        class="py-1 px-3 bg-teal-500 active:bg-teal-600 rounded-md text-white"
        on:click={resetWorkCount}
    >
        작업 카운트 초기화
    </button>
</div>

<div class="mb-2">
    {#each useComRes as useCom}
        <span class="mr-2">{useCom.n_use_com} : {useCom.count}</span>
    {/each}
</div>

<div class="w-full min-w-[800px] overflow-auto">
    <div class="w-full max-w-[1200px]">
        <table class="w-full text-center">
            <tr class="text-xs text-center">
                <th class="border py-2 w-11">
                    <div class="flex justify-center items-center pl-2">
                        <Checkbox on:change={allChk} bind:checked={allChkVal} />
                    </div>
                </th>
                <th class="border p-1"> 아이디 </th>
                <th class="border p-1"> 비밀번호 </th>
                <th class="border p-1 min-w-[120px]"> 메모1 </th>
                <th class="border p-1"> 메모2 </th>
                <th class="border p-1"> 정상여부 </th>
                <th class="border p-1"> 카페 </th>
                <th class="border p-1"> 블로그<br />순서 </th>
                <th class="border p-1"> 프로필 </th>
                <th class="border p-1"> UA </th>
                <!-- <th class="border p-1"> 아이디 </th> -->
                <th class="border p-1"> 작업카운트 </th>
                <th class="border p-1"> 작업시간 </th>
            </tr>

            {#each nworkList as nwork, idx}
                <tr>
                    <td class="border py-2 w-11">
                        <div class="flex justify-center items-center pl-2 mb-1">
                            <Checkbox
                                value={idx}
                                bind:group={selectChk}
                                on:change={() => {
                                    if (selectChk.length == 25) {
                                        allChkVal = true;
                                    } else {
                                        allChkVal = false;
                                    }
                                }}
                            />
                        </div>
                        <div>{nwork.n_idx}</div>
                    </td>
                    <td class="border p-1 text-xs">
                        {nwork.n_id}
                    </td>
                    <td class="border border-slate-300 p-1 min-w-[90px] w-32">
                        {#if exCopyBool}
                            {nworkList[idx]["n_pwd"]}
                        {:else}
                            <input
                                type="text"
                                class="w-full border-slate-300 rounded-lg text-xs"
                                bind:value={nworkList[idx]["n_pwd"]}
                            />
                        {/if}
                    </td>
                    <td class="border border-slate-300 p-1 min-w-[50px]">
                        {#if exCopyBool}
                            {nworkList[idx]["n_memo1"]}
                        {:else}
                            <input
                                type="text"
                                class="w-full border-slate-300 rounded-lg text-xs"
                                bind:value={nworkList[idx]["n_memo1"]}
                            />
                        {/if}
                    </td>
                    <td class="border border-slate-300 p-1 min-w-[200px]">
                        {#if exCopyBool}
                            {nworkList[idx]["n_memo2"]}
                        {:else}
                            <input
                                type="text"
                                class="w-full border-slate-300 rounded-lg text-xs"
                                bind:value={nworkList[idx]["n_memo2"]}
                            />
                        {/if}
                    </td>

                    {#if !exCopyBool}
                        <td class="border border-slate-300 w-12 pr-0 pl-3">
                            <Toggle
                                size="small"
                                checked={nworkList[idx]["n_use"] == 1
                                    ? true
                                    : false}
                                on:change={() => {
                                    nworkList[idx]["n_use"] =
                                        !nworkList[idx]["n_use"];
                                }}
                            />
                        </td>

                        <!-- <td
                            class="border border-slate-300 w-12 pr-0 pl-3"
                            >
                            <Toggle
                                size="small"
                                checked={nworkList[idx]["n_blog_work"] == 1
                                    ? true
                                    : false}
                                on:change={() => {
                                    nworkList[idx]["n_blog_work"] =
                                        !nworkList[idx]["n_blog_work"];
                                }}
                            />
                            </td>
                            <td
                                class="border border-slate-300 w-12 pr-0 pl-3"
                            >
                                <Toggle
                                    size="small"
                                    checked={nworkList[idx]["n_blog_standby"] == 1
                                        ? true
                                        : false}
                                    on:change={() => {
                                        nworkList[idx]["n_blog_standby"] =
                                            !nworkList[idx]["n_blog_standby"];
                                    }}
                                />
                            </td> -->

                        <!-- <td class="border border-slate-300 w-12 pr-0 pl-3">
                            <Toggle
                                size="small"
                                checked={nworkList[idx]["n_link_use"] == 1
                                    ? true
                                    : false}
                                on:change={() => {
                                    nworkList[idx]["n_link_use"] =
                                        !nworkList[idx]["n_link_use"];
                                }}
                            />
                        </td> -->

                        <td class="border border-slate-300 w-12 pr-0 pl-3">
                            <Toggle
                                size="small"
                                checked={nworkList[idx]["n_cafe"] == 1
                                    ? true
                                    : false}
                                on:change={() => {
                                    nworkList[idx]["n_cafe"] =
                                        !nworkList[idx]["n_cafe"];
                                }}
                            />
                        </td>
                        <!-- <td class="border border-slate-300 w-20">
                            <Toggle
                                size="small"
                                checked={nKinList[idx]}
                                on:change={() => {
                                    nKinList[idx] = !nKinList[idx];
                                }}
                            />
                            </td> -->

                        <td class="border border-slate-300 p-1 text-sm w-16">
                            <input
                                type="text"
                                class="w-full border-slate-300 rounded-lg text-xs"
                                bind:value={nworkList[idx]["n_blog_order"]}
                            />
                        </td>

                        <td class="border border-slate-300 p-1 text-sm w-16">
                            <input
                                type="text"
                                class="w-full border-slate-300 rounded-lg text-xs"
                                bind:value={nworkList[idx]["n_ch_profile"]}
                            />
                        </td>

                        <td class="border border-slate-300 p-1 text-sm w-16">
                            <input
                                type="text"
                                class="w-full border-slate-300 rounded-lg text-xs"
                                bind:value={nworkList[idx]["n_ua"]}
                            />
                        </td>

                        <td class="border border-slate-300 p-1 text-sm w-16">
                            {nworkList[idx]["n_work_count"]}
                        </td>

                        <!-- <td class="border border-slate-300 p-1 text-sm w-20">
                            <input
                                type="text"
                                class="w-full border-slate-300 rounded-lg text-xs px-1 py-2"
                                bind:value={nworkList[idx]["n_use_com"]}
                            />
                        </td> -->
                    {/if}
                    <td class="border border-slate-300 w-20 pr-0 p-1.5 text-xs">
                        {moment(nworkList[idx]["n_lastwork_at"]).format(
                            "MM/DD HH:mm",
                        )}
                    </td>
                </tr>
            {/each}
        </table>
    </div>
</div>

<nav aria-label="Page navigation" class="mb-10">
    <ul class="flex items-center justify-center -space-x-px h-8 mt-5">
        <li>
            <button
                class="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                on:click={() => {
                    setParams({ page: 1 });
                }}
            >
                <i class="fa fa-angle-left" aria-hidden="true"></i>
            </button>
        </li>

        {#each pagenation as paging, idx}
            <li>
                <button
                    class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    class:bg-blue-300={paging == Number(data.page)}
                    on:click={() => {
                        const baseQuery = $page.url.searchParams.get("base");
                        setParams({ page: paging });
                    }}
                >
                    {paging}
                </button>
            </li>
        {/each}

        <li>
            <button
                class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                on:click={() => {
                    setParams({ page: maxPage });
                }}
            >
                <i class="fa fa-angle-right" aria-hidden="true"></i>
            </button>
        </li>
    </ul>
</nav>
