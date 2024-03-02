<script>
    import moment from "moment-timezone";
    moment.tz.setDefault("Asia/Seoul");
    let cafeWorkList = [];
    let startDate = moment().subtract(3, "days").format("YYYY-MM-DD");
    let endDate = moment().format("YYYY-MM-DD");
    export let data;

    $: data, setData();
    function setData() {
        cafeWorkList = data.cafe_work_list;
    }

    function searchDate() {
        console.log("lasidjfliasjdf");
    }
</script>

<div class="mb-5">
    <form on:submit={searchDate}>
        <label class="mr-3">
            <span>시작일 : </span>
            <input
                type="date"
                name="start_date"
                bind:value={startDate}
                class="p-1 text-sm border-gray-400 rounded-md"
            />
        </label>

        <label class="mr-3">
            <span>종료일 : </span>
            <input
                type="date"
                name="end_date"
                bind:value={endDate}
                class="p-1 text-sm border-gray-400 rounded-md"
            />
        </label>
        <button
            class="py-1 px-3 bg-blue-500 active:bg-blue-600 text-white rounded-md"
        >
            검색
        </button>
    </form>
</div>

<div>
    <table class="w-full">
        <tr>
            <th class="border p-2">링크</th>
            <th class="border p-2">작업횟수</th>
        </tr>

        {#each cafeWorkList as cafeWork}
            <tr>
                <td class="border p-2">
                    {cafeWork.cw_link}
                </td>
                <td class="border p-2">
                    {cafeWork.cw_work_count}
                </td>
            </tr>
        {/each}
    </table>
</div>
