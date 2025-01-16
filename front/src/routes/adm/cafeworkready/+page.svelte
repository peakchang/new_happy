<script>
    import axios from "axios";
    import { Button, Modal, Radio } from "flowbite-svelte";
    import moment from "moment";
    import { back_api } from "$src/lib/const";
    import { invalidateAll } from "$app/navigation";
    import * as XLSX from "xlsx";

    let cafeDataModal = false;

    export let data;

    let cafeIdList = [];
    let cafeList = [];
    let cafeWorkReadyList = [];
    console.log(data);
    $: data, setData();
    function setData() {
        cafeIdList = data.cafe_id_list;
        cafeList = data.cafe_list;

        cafeWorkReadyList = data.cafe_work_ready_list;
        console.log(cafeIdList);

        console.log(cafeWorkReadyList);
    }

    // 삭제할때 쓰는 변수
    let allChecked = false;
    let checkedList = [];

    // 네이버 아이디 / 카페는 기존 리스트가 있으니까 index 값만 변수에 넣어서 리스트에 넣기!
    let getCafeIdx = "";

    let getSubject = "";
    let getContentType = "";
    let uploadCafeWorkData = {
        cr_work_date: moment().format("YYYY-MM-DD"),
        data_arr: [],
    };

    console.log(uploadCafeWorkData["cr_work_date"]);

    let getContent = "";

    let contentBoxBool = true;

    // 최종 업로드 할 배열 값!!

    function typeChange() {
        if (this.value === "write") {
            contentBoxBool = false;
        } else {
            contentBoxBool = true;
        }
    }

    function addWorkReady() {
        console.log(getCafeIdx);
        console.log(getSubject);
        console.log(getContentType);
        console.log(getContent);

        if (
            !uploadCafeWorkData["cr_n_idx"] ||
            !getCafeIdx ||
            !getSubject ||
            !getContentType ||
            !uploadCafeWorkData["cr_work_date"]
        ) {
            alert("빈 항목이 있습니다. 확인 해주세요");
            return;
        }

        const tempData = {};
        tempData.sbj = getSubject;
        tempData.con_type = getContentType;
        tempData.cafe_idx = getCafeIdx;
        if (getContentType == "write") {
            tempData.con = getContent;
        }

        const tempArr = [...uploadCafeWorkData["data_arr"]];
        tempArr.push(tempData);
        uploadCafeWorkData["data_arr"] = tempArr;

        console.log(uploadCafeWorkData);
        (getCafeIdx = ""),
            (getSubject = ""),
            (getContentType = ""),
            (getContent = "");
    }

    async function updateWorkReady() {
        console.log(uploadCafeWorkData);
        const cr_cafe_idx = uploadCafeWorkData.data_arr.map(
            (item) => item.cafe_idx,
        );
        const cr_subjectlist = uploadCafeWorkData.data_arr.map(
            (item) => item.sbj,
        );
        const cr_content_type = uploadCafeWorkData.data_arr.map(
            (item) => item.con_type,
        );
        const contentVars = {};
        uploadCafeWorkData.data_arr.forEach((item, index) => {
            contentVars[`cr_content${index}`] = item.con;
        });
        console.log(cr_cafe_idx);
        console.log(contentVars);

        try {
            const res = await axios.post(
                `${back_api}/cafe_work/update_work_ready`,
                {
                    cr_id: uploadCafeWorkData["cr_id"]
                        ? uploadCafeWorkData["cr_id"]
                        : "",
                    cr_n_idx: uploadCafeWorkData["cr_n_idx"],
                    cr_work_date: uploadCafeWorkData["cr_work_date"],
                    cr_cafe_idx: cr_cafe_idx.join(","),
                    cr_subjectlist: cr_subjectlist.join(","),
                    cr_content_type: cr_content_type.join(","),
                    contentVars,
                },
            );

            if (res.status == 200) {
                invalidateAll();
            }
        } catch (error) {
            console.error(error.message);
        }
    }

    function openModifyModal() {
        console.log(this.value);
        const setData = cafeWorkReadyList[this.value];
        console.log(setData);

        uploadCafeWorkData["cr_id"] = setData.cr_id;
        uploadCafeWorkData["cr_n_idx"] = Number(setData.cr_n_idx);
        uploadCafeWorkData["cr_work_date"] = moment(
            setData.cr_work_date,
        ).format("YYYY-MM-DD");

        console.log(uploadCafeWorkData);
        const cafeIdxArray = setData.cr_cafe_idx.split(",");
        const contentTypeArray = setData.cr_content_type.split(",");
        const subjectListArray = setData.cr_subjectlist.split(",");

        // 2. 배열 길이를 기준으로 반복문 실행
        const result = cafeIdxArray.map((_, index) => ({
            cafe_idx: parseInt(cafeIdxArray[index], 10), // 숫자로 변환
            con_type: contentTypeArray[index],
            sbj: subjectListArray[index],
            con:
                contentTypeArray[index] === "write"
                    ? setData[`cr_content${index}`]
                    : "",
        }));
        console.log(result);

        uploadCafeWorkData.data_arr = result;

        cafeDataModal = true;
    }

    function getObjectById(data, id, param) {
        return data.find((item) => item[param] === id);
    }

    let ex_rows;
    let ex_filename = "엑셀 파일 선택";
    async function uploadExcel(e) {
        ex_filename = e.target.files[0].name;
        let reader = new FileReader();
        reader.onload = function () {
            console.log("reader 들어옴!!");

            let data = reader.result;
            let workBook = XLSX.read(data, { type: "binary" });
            workBook.SheetNames.forEach(function (sheetName) {
                // let rows = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
                let data = XLSX.utils.sheet_to_json(workBook.Sheets["Sheet1"], {
                    raw: false,
                });
                const rows = data.map((row) => {
                    for (const key in row) {
                        if (
                            typeof row[key] === "string" &&
                            row[key].includes("/")
                        ) {
                            row[key] = moment(row[key], "M/D/YY").format(
                                "YYYY-MM-DD",
                            );
                        }
                    }
                    return row;
                });

                ex_rows = rows;
            });
        };
        reader.readAsBinaryString(e.target.files[0]);
    }

    async function updateExcelCafeReady() {
        console.log(ex_rows);
        try {
            const res = await axios.post(
                `${back_api}/cafe_work/update_excel_cafe_ready`,
                { ex_rows },
            );
            if (res.status == 200) {
                invalidateAll();
            }
        } catch (error) {}
    }

    async function deleteChecked() {
        if (!confirm("삭제한 항목은 복구 불가합니다.~")) {
            return;
        }

        try {
            const res = await axios.post(
                `${back_api}/cafe_work/delete_checkd`,
                { checkedList },
            );
            if (res.status == 200) {
                invalidateAll();
                checkedList = [];
                allChecked = false;
            }
        } catch (error) {}
        console.log(checkedList);
    }
</script>

<Modal title="Terms of Service" size="lg" bind:open={cafeDataModal} autoclose>
    <table class="w-full mb-4">
        <tr>
            <th class="w-1/4 border p-2">아이디 선택</th>
            <td class="w-3/4 border p-2">
                <select
                    class="w-full border-gray-300 text-xs rounded-md"
                    bind:value={uploadCafeWorkData["cr_n_idx"]}
                >
                    <option value="">선택하세요</option>
                    {#each cafeIdList as cafeId, idx}
                        <option value={cafeId.n_idx}>{cafeId.n_id}</option>
                    {/each}
                </select>
            </td>
        </tr>
        <tr>
            <th class="border p-2">작업일</th>
            <td class="border p-2">
                <input
                    type="date"
                    class="text-xs border-gray-300 rounded-md"
                    bind:value={uploadCafeWorkData["cr_work_date"]}
                />
            </td>
        </tr>
    </table>

    <table class="w-full">
        <tr>
            <th class="border p-2">제목</th>
            <th class="border p-2">컨텐츠</th>
            <th class="border p-2">카페</th>
        </tr>

        <tr>
            <th class="border p-2">
                <input
                    type="text"
                    class="w-full border-gray-300 text-xs rounded-md focus:border-none"
                    bind:value={getSubject}
                />
            </th>
            <th class="border p-2">
                <div class="flex justify-center items-center gap-3">
                    <Radio
                        value="GPT"
                        bind:group={getContentType}
                        on:change={typeChange}>GPT</Radio
                    >
                    <Radio
                        value="write"
                        bind:group={getContentType}
                        on:change={typeChange}>작성</Radio
                    >
                </div>
                <div class="mt-3" class:hidden={contentBoxBool}>
                    <textarea
                        class="w-full border-gray-300 text-xs focus:border-none"
                        bind:value={getContent}
                    />
                </div>
            </th>
            <th class="border p-2">
                <select
                    class="w-full border-gray-300 text-xs rounded-md"
                    bind:value={getCafeIdx}
                >
                    <option value="">선택하세요</option>
                    {#each cafeList as cafe, idx}
                        <option value={cafe.cl_id}>
                            {cafe.cl_link.split("/").pop()} / {cafe.cl_board_name}
                        </option>
                    {/each}
                </select>
            </th>
        </tr>
    </table>

    {#if uploadCafeWorkData["data_arr"].length > 0}
        <table class="w-full">
            <tr>
                <th class="border p-2">제목</th>
                <th class="border p-2">컨텐츠 타입</th>
                <th class="border p-2">카페</th>
                <th class="border p-2">삭제</th>
            </tr>
            {#each uploadCafeWorkData["data_arr"] as data, idx}
                <tr>
                    <td class="border p-2 text-center">{data.sbj}</td>
                    <td class="border p-2 text-center">
                        {data.con_type}
                        <!-- svelte-ignore missing-declaration -->
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        {#if data.con_type == "write"}
                            / <span
                                class=" cursor-pointer"
                                on:click={(e) => {
                                    const currentElement = e.target;
                                    const nextElement =
                                        e.target.nextElementSibling;
                                    console.log(currentElement);
                                    console.log(nextElement);

                                    console.log(currentElement.textContent);

                                    if (currentElement.textContent === "보기") {
                                        // '보기'일 때 -> hidden 클래스 제거 & 텍스트 변경
                                        nextElement.classList.remove("hidden");
                                        currentElement.textContent = "닫기";
                                    } else if (
                                        currentElement.textContent === "닫기"
                                    ) {
                                        console.log("닫기 안들어와?!?!");

                                        // '닫기'일 때 -> hidden 클래스 추가 & 텍스트 변경
                                        nextElement.classList.add("hidden");
                                        currentElement.textContent = "보기";
                                    }
                                }}
                            >
                                보기
                            </span>
                        {/if}
                        <div class="hidden whitespace-pre-wrap">{data.con}</div>
                    </td>
                    <td class="border p-2 text-center"
                        >{getObjectById(cafeList, data.cafe_idx, "cl_id")
                            ["cl_link"].split("/")
                            .pop()} / {getObjectById(
                            cafeList,
                            data.cafe_idx,
                            "cl_id",
                        )["cl_board_name"]}
                    </td>
                    <td class="border p-2 text-center">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <span
                            class="text-xl text-red-600"
                            data-value={idx}
                            on:click={(e) => {
                                const delIdx =
                                    e.target.getAttribute("data-value");
                                console.log(
                                    e.target.getAttribute("data-value"),
                                );
                                console.log(uploadCafeWorkData["data_arr"]);
                                uploadCafeWorkData["data_arr"] = [
                                    ...uploadCafeWorkData["data_arr"],
                                ].filter(
                                    (_, index) => index !== Number(delIdx),
                                );
                            }}
                        >
                            <i
                                class="fa fa-times-circle-o pointer-events-none"
                                aria-hidden="true"
                            ></i>
                        </span>
                    </td>
                </tr>
            {/each}
        </table>
    {/if}

    <div class="flex justify-end items-center gap-5">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            class=" cursor-pointer border p-2.5 rounded-lg"
            on:click={addWorkReady}
        >
            추가
        </div>
        <Button on:click={updateWorkReady}>적용 및 닫기</Button>
    </div>
</Modal>

<div class="mb-5">
    <Button
        size="xs"
        on:click={() => {
            uploadCafeWorkData = {
                cr_work_date: moment().format("YYYY-MM-DD"),
                data_arr: [],
            };
            cafeDataModal = true;
        }}
    >
        항목 추가하기
    </Button>

    <input
        type="file"
        class="border text-xs rounded-md"
        accept=".xlsx, .xls"
        on:change={uploadExcel}
    />

    <Button size="xs" color="blue" on:click={updateExcelCafeReady}>
        항목 추가하기
    </Button>

    <Button size="xs" color="green" on:click={deleteChecked}>선택삭제</Button>
</div>

<table class="w-full text-center">
    <tr>
        <th class="border">
            <input
                type="checkbox"
                bind:checked={allChecked}
                on:change={(e) => {
                    console.log(e.target.checked);
                    if (e.target.checked == true) {
                        checkedList = cafeWorkReadyList.map(
                            (item) => item.cr_id,
                        );
                    } else {
                        checkedList = [];
                    }
                }}
            />
        </th>
        <th class="border p-2">아이디</th>
        <th class="border p-2">작업갯수</th>
        <th class="border p-2">버튼</th>
        <th class="border p-2">작업일</th>
    </tr>

    {#each cafeWorkReadyList as data, idx}
        <tr>
            <td class="border">
                <input
                    type="checkbox"
                    value={data.cr_id}
                    bind:group={checkedList}
                />
            </td>
            <td class="border p-2">
                {getObjectById(cafeIdList, Number(data.cr_n_idx), "n_idx").n_id}
            </td>
            <td class="border p-2">
                {data.cr_cafe_idx.split(",").length}
            </td>
            <td class="border p-2">
                <Button value={idx} size="xs" on:click={openModifyModal}>
                    확인 및 추가하기
                </Button>
            </td>
            <td class="border p-2">
                {moment(data.cr_work_date).format("YYYY-MM-DD")}
            </td>
        </tr>
    {/each}
</table>
