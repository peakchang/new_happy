<script>
    import axios from "axios";
    import { sub_api } from "$src/lib/const";

    let getImgUrl;

    async function testApiFunc() {
        const res = await axios.get(`${sub_api}/api/testget`);
        console.log(res.data);
    }

    async function imgChangeFunc(e) {
        const uploadFile = e.target.files[0];
        const formData = new FormData();
        formData.append("testfile", uploadFile);

        for (const [key, value] of formData.entries()) {
            console.log(key, value);
        }

        try {
            const res = await axios.post(
                `${sub_api}/api/testupload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            console.log(res.data);
            getImgUrl = res.data.imgPath
        } catch (error) {
            alert("에러가 발생했습니다. 다시 시도해주세요");
            return false;
        }
    }
</script>

<button on:click={testApiFunc}> 테스트 버튼!! </button>

asdlkfjalsdjflasjdflijasf

<input type="file" on:change={imgChangeFunc} />

{#if getImgUrl}
    <img src={getImgUrl} alt="" />
{/if}
