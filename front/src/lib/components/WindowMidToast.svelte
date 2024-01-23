<script>
    import { fly, scale, fade } from "svelte/transition";

    export let toastBool = false;
    export let toastMessage = "";

    $: {
        if (toastBool == true) {
            setTimeout(() => {
                toastBool = false;
            }, 1500);
        }
    }
</script>

{#if toastBool}
    <div
        transition:fade={{}}
        class="fixed bottom-48 left-1/2 bg-slate-600 z-50 text-white py-1 px-8 rounded-lg"
        style="transform: translate(-50%, 0);"
    >
        {toastMessage}
    </div>
{/if}
