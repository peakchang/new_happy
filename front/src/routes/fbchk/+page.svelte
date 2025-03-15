<script>
    import axios from "axios";
    import { back_api } from "$src/lib/const";
    let leadsId = "";
    let formId = "";

    async function getData() {
        console.log(leadsId);
        console.log(formId);


        console.log(`${back_api}/fbchk`);
        
        try {
            const res = await axios.post(`${back_api}/fbchk`, {
                leadsId,
                formId,
            });
            if (res.status == 200) {
                console.log(res.data);
            }
        } catch (error) {
            console.error(error.message);
        }
    }
</script>

<input type="text" bind:value={leadsId} />
<input type="text" bind:value={formId} />

<button on:click={getData}> 얻어보자!! </button>
