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

    let addId = ""; // 추가될 아이디
    let addPwd = ""; // 추가될 비번
    let addRowModal = false; // 아이디 추가 modal

    console.log($page);
    

    let searchVal = $page.url.searchParams.get('base') || "n_use"; // 검색 목록 체크
    let searchIdVal = $page.url.searchParams.get("id")
        ? $page.url.searchParams.get("id")
        : "";

    let nworkList = []; // 전체 리스트 항목~ 업데이트는 여기서 총관리~

    let exCopyBool = false;
    let anyBlogSort = false;

    if(searchVal == "n_use"){
        anyBlogSort = $page.url.searchParams.get('anysort') || true;
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
        const reqObj = {
            n_id: addId,
            n_pwd: addPwd,
        };

        try {
            const res = await axios.post(`${back_api}/nwork/add_row`, {
                reqObj,
            });
            if (res.data.status) {
                addId = "";
                addPwd = "";
                invalidateAll();
                alert("업데이트가 완료 되었습니다.");
            } else {
                alert("중복된 아이디가 있습니다.");
            }
        } catch (error) {
            alert("요청 실패");
        }
    }

    function searchFunc() {
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
</script>

<Modal title="Terms of Service" bind:open={addRowModal} autoclose>
    <div>
        <Table hoverable={true}>
            <TableHead>
                <TableHeadCell class="border border-slate-300">
                    아이디
                </TableHeadCell>
                <TableHeadCell class="border border-slate-300">
                    비밀번호
                </TableHeadCell>
            </TableHead>
            <TableBody tableBodyClass="divide-y">
                <TableBodyRow>
                    <TableBodyCell class="border border-slate-300 p-1 ">
                        <input
                            type="text"
                            class="w-full border-slate-300 rounded-lg text-xs"
                            bind:value={addId}
                        />
                    </TableBodyCell>
                    <TableBodyCell class="border border-slate-300 p-1 text-sm">
                        <input
                            type="text"
                            class="w-full border-slate-300 rounded-lg text-xs"
                            bind:value={addPwd}
                        />
                    </TableBodyCell>
                </TableBodyRow>
            </TableBody>
        </Table>
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

    <div class="text-xs md:text-sm">
        <select
            bind:value={searchVal}
            class="py-1 px-5 text-xs rounded-md border-gray-400"
        >
            <option value="all">전체보기</option>
            <option value="n_cafe">카페</option>
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
            class="absolute top-[-1px] right-1 text-lg text-gray-500"
            on:click={() => {
                searchIdVal = "";
            }}
        >
            <i class="fa fa-times-circle-o" aria-hidden="true"></i>
        </button>
    </div>

    <button
        class="py-1 px-3 bg-amber-600 rounded-md text-white"
        on:click={searchFunc}
    >
        검색
    </button>

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
</div>

<div class="mb-2">
    {#each useComRes as useCom}
        <span class="mr-2">{useCom.n_use_com} : {useCom.count}</span>
    {/each}
</div>

<div class="w-full min-w-[800px] overflow-auto">
    <div class="w-full max-w-[1200px]">
        <Table striped={true}>
            <TableHead>
                <TableHeadCell class="!p-4 w-11 border border-slate-300">
                    <Checkbox on:change={allChk} bind:checked={allChkVal} />
                </TableHeadCell>
                <TableHeadCell class="border border-slate-300 p-1 text-center">
                    아이디
                </TableHeadCell>
                <TableHeadCell class="border border-slate-300 p-1 text-center">
                    비밀번호
                </TableHeadCell>
                <TableHeadCell
                    class="border border-slate-300 p-1 text-center min-w-[120px]"
                >
                    메모1
                </TableHeadCell>
                <TableHeadCell class="border border-slate-300 p-1 text-center">
                    메모2
                </TableHeadCell>

                {#if !exCopyBool}
                    <TableHeadCell
                        class="border border-slate-300 p-1 text-center"
                    >
                        정상여부
                    </TableHeadCell>
                    <!-- <TableHeadCell class="border border-slate-300 p-1 text-center">
                    진행<br />블로그
                </TableHeadCell>
                <TableHeadCell class="border border-slate-300 p-1 text-center">
                    대기<br />블로그
                </TableHeadCell> -->
                    <!-- <TableHeadCell
                        class="border border-slate-300 p-1 text-center"
                    >
                        막블로그
                    </TableHeadCell> -->
                    <TableHeadCell
                        class="border border-slate-300 p-1 text-center"
                    >
                        링크사용
                    </TableHeadCell>
                    <TableHeadCell
                        class="border border-slate-300 p-1 text-center"
                    >
                        카페
                    </TableHeadCell>
                    <TableHeadCell
                        class="border border-slate-300 p-0.5 text-center"
                    >
                        블로그<br />순서
                    </TableHeadCell>

                    <TableHeadCell
                        class="border border-slate-300 p-1 text-center"
                    >
                        <span>프로필</span>
                    </TableHeadCell>
                    <TableHeadCell
                        class="border border-slate-300 p-1 text-center"
                    >
                        <span>컴</span>
                    </TableHeadCell>
                {/if}
                <TableHeadCell class="border border-slate-300 p-1 text-center">
                    <span>작업시간</span>
                </TableHeadCell>
                <!-- <TableHeadCell class="border border-slate-300">날짜</TableHeadCell> -->
            </TableHead>
            <TableBody tableBodyClass="divide-y">
                {#each nworkList as nwork, idx}
                    <TableBodyRow>
                        <TableBodyCell class="!p-4 border border-slate-300">
                            <Checkbox
                                value={idx}
                                bind:group={selectChk}
                                on:change={() => {
                                    if (selectChk.length == 30) {
                                        allChkVal = true;
                                    } else {
                                        allChkVal = false;
                                    }
                                }}
                            />
                            {nwork.n_idx}
                        </TableBodyCell>
                        <TableBodyCell
                            class="border border-slate-300 p-1 text-center text-xs"
                        >
                            {nwork.n_id}
                        </TableBodyCell>
                        <TableBodyCell
                            class="border border-slate-300 p-1 min-w-[90px] w-32"
                        >
                            {#if exCopyBool}
                                {nworkList[idx]["n_pwd"]}
                            {:else}
                                <input
                                    type="text"
                                    class="w-full border-slate-300 rounded-lg text-xs"
                                    bind:value={nworkList[idx]["n_pwd"]}
                                />
                            {/if}
                        </TableBodyCell>
                        <TableBodyCell
                            class="border border-slate-300 p-1 min-w-[50px]"
                        >
                            {#if exCopyBool}
                                {nworkList[idx]["n_memo1"]}
                            {:else}
                                <input
                                    type="text"
                                    class="w-full border-slate-300 rounded-lg text-xs"
                                    bind:value={nworkList[idx]["n_memo1"]}
                                />
                            {/if}
                        </TableBodyCell>
                        <TableBodyCell
                            class="border border-slate-300 p-1 min-w-[280px]"
                        >
                            {#if exCopyBool}
                                {nworkList[idx]["n_memo2"]}
                            {:else}
                                <input
                                    type="text"
                                    class="w-full border-slate-300 rounded-lg text-xs"
                                    bind:value={nworkList[idx]["n_memo2"]}
                                />
                            {/if}
                        </TableBodyCell>

                        {#if !exCopyBool}
                            <TableBodyCell
                                class="border border-slate-300 w-12 pr-0 pl-3"
                            >
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
                            </TableBodyCell>

                            <!-- <TableBodyCell
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
                        </TableBodyCell>
                        <TableBodyCell
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
                        </TableBodyCell> -->
                            
                            <TableBodyCell
                                class="border border-slate-300 w-12 pr-0 pl-3"
                            >
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
                            </TableBodyCell>

                            <TableBodyCell
                                class="border border-slate-300 w-12 pr-0 pl-3"
                            >
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
                            </TableBodyCell>
                            <!-- <TableBodyCell class="border border-slate-300 w-20">
                    <Toggle
                        size="small"
                        checked={nKinList[idx]}
                        on:change={() => {
                            nKinList[idx] = !nKinList[idx];
                        }}
                    />
                </TableBodyCell> -->

                            <TableBodyCell
                                class="border border-slate-300 p-1 text-sm w-16"
                            >
                                <input
                                    type="text"
                                    class="w-full border-slate-300 rounded-lg text-xs"
                                    bind:value={nworkList[idx]["n_blog_order"]}
                                />
                            </TableBodyCell>

                            <TableBodyCell
                                class="border border-slate-300 p-1 text-sm w-16"
                            >
                                <input
                                    type="text"
                                    class="w-full border-slate-300 rounded-lg text-xs"
                                    bind:value={nworkList[idx]["n_ch_profile"]}
                                />
                            </TableBodyCell>

                            <TableBodyCell
                                class="border border-slate-300 p-1 text-sm w-20"
                            >
                                <input
                                    type="text"
                                    class="w-full border-slate-300 rounded-lg text-xs px-1 py-2"
                                    bind:value={nworkList[idx]["n_use_com"]}
                                />
                            </TableBodyCell>
                        {/if}

                        <TableBodyCell
                            class="border border-slate-300 w-12 pr-0 p-1.5 text-xs"
                        >
                            {moment(nworkList[idx]["n_lastwork_at"]).format(
                                "MM/DD HH:mm",
                            )}
                        </TableBodyCell>

                        <!-- <TableBodyCell class="border border-slate-300 p-1 text-sm">
                    {nwork.date_str ? nwork.date_str : ""}
                </TableBodyCell> -->
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    </div>
</div>

<nav aria-label="Page navigation" class="">
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
