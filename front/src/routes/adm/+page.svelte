<script>
    import {
        admin_sidebar,
        admin_sidebar_width,
        authStatus,
    } from "$src/lib/store";
    import axios from "axios";
    import { back_api } from "$src/lib/const";
    import Cookies from "js-cookie";

    let pwdVal = "";

    async function goAuth(e) {
        e.preventDefault();
        const res = await axios.post(`${back_api}`, { pwdVal });
        if (res.data.validPassword) {
            alert("인증 완료~");
            $authStatus = "ok";
            Cookies.set("adm_auth");
        } else {
            alert("인증 실패~");
        }
    }
</script>

{#if !$authStatus}
    <form on:submit={goAuth}>
        <input
            type="text"
            placeholder="비밀번호를 입력하세요"
            class="py-1.5 text-sm"
            bind:value={pwdVal}
        />
        <button class="py-1.5 px-5 text-sm bg-blue-500 active:bg-blue-600">
            확인
        </button>
    </form>
{/if}
