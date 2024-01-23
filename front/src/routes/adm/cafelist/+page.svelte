<script>
    import ModalCustom from "$lib/components/design/ModalCustom.svelte";
    import CheckBoxBase from "$lib/components/design/CheckBoxBase.svelte";
    import Toggle from "$lib/components/design/Toggle.svelte";
    let cafeAddModalBool = false;
</script>

<ModalCustom bind:open={cafeAddModalBool}>
    <div>
        <label>
            카페 주소 :
            <input
                type="text"
                class="py-1 rounded-md border-gray-300 focus:ring-0 w-full"
            />
        </label>
    </div>
</ModalCustom>

<div class="mb-5">
    <button
        on:click={() => {
            cafeAddModalBool = !cafeAddModalBool;
        }}
        class="bg-green-500 active:bg-green-600 py-1 px-4 rounded-md text-white"
    >
        카페 추가
    </button>
</div>

<div class="w-full overflow-auto">
    <div class="w-full min-w-[800px]">
        <table class="w-full text-center">
            <tr>
                <th class="border py-2">
                    <CheckBoxBase color="red" />
                </th>
                <th class="border py-2"> 카페 주소 </th>
                <th class="border py-2"> 게시판 </th>
                <th class="border py-2"> 사용 여부 </th>
                <th class="border py-2"> 가입 조건 </th>
            </tr>

            <tr>
                <td class="border p-1.5">
                    <CheckBoxBase color="red" />
                </td>
                <td class="border p-1.5 "> https://cafe.naver.com/gnlcks33 </td>
                <td class="border p-1.5">
                    <input
                        type="text"
                        class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                    />
                </td>
                <td class="border p-1.5">
                    <Toggle color="red" />
                </td>
                <td class="border p-1.5">
                    <input
                        type="text"
                        class="p-1 px-2 text-sm focus:ring-0 focus:border-red-300 border-gray-300 w-full rounded-md"
                    />
                </td>
            </tr>
        </table>
    </div>
</div>
