<script>
    export let checked = "checked";
    // export let color = "yellow";

    function toggleChange() {
        console.log(this.checked);
        checked = this.checked;
    }
</script>

<label class="relative inline-flex items-center cursor-pointer mt-1">
    <input
        type="checkbox"
        value=""
        class="sr-only peer"
        {checked}
        on:change={toggleChange}
    />
    <div
        class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-0 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-500"
    ></div>
    <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
        <slot />
    </span>
</label>
