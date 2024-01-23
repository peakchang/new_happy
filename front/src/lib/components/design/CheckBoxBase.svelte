<script>
    export let value = "";
    export let group = [];
    export let color = "blue";
</script>

<label>
    <input
        checked
        id="checked-checkbox"
        type="checkbox"
        {value}
        bind:group
        class="w-4 h-4 text-{color}-500 bg-gray-100 border-gray-300 rounded focus:outline-none dark:ring-offset-gray-800 focus:ring-0 dark:bg-gray-700 dark:border-gray-600 mb-[2px]"
    />
    <slot />
</label>
