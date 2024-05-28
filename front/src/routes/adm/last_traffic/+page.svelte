<script>
    import moment from "moment-timezone";
    let allData = [];
    export let data;

    $: data, setData();
    function setData() {
        allData = data.allData;
        console.log(allData);
    }
</script>

<div class="w-full min-w-[800px] overflow-auto">
    <div class="w-full max-w-[1200px]">
        <table class="w-full text-center">
            <tr>
                <th class="border py-2">아이디</th>
                <th class="border py-2">마지막 작업 시간</th>
            </tr>
            {#each allData as data}
                <tr>
                    <td class="border py-2">{data.lt_name}</td>
                    <td class="border py-2">{moment(data.lt_last_time).format('YY/MM/DD HH:ss:mm')}</td>
                </tr>
            {/each}
        </table>
    </div>
</div>
