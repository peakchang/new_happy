<script>
    import {
        admin_sidebar,
        admin_sidebar_width,
        authStatus,
    } from "$src/lib/store";
    import axios from "axios";
    import { back_api } from "$src/lib/const";

    let pwdVal = "";

    async function goAuth() {
        const res = await axios.post(`${back_api}`, { pwdVal });
        if (res.data.validPassword) {
            alert("인증 완료~");
            $authStatus = "ok";
        } else {
            alert("인증 실패~");
        }

        console.log(res.data.validPassword);
    }
</script>

{#if !$authStatus}
    <input
        type="text"
        placeholder="비밀번호를 입력하세요"
        class="py-1.5 text-sm"
        bind:value={pwdVal}
    />
    <button
        class="py-1.5 px-5 text-sm bg-blue-500 active:bg-blue-600"
        on:click={goAuth}
    >
        확인
    </button>
{/if}
