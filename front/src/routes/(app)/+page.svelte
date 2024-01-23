<script>
    import { Modal, Button, Label, Input, Checkbox } from "flowbite-svelte";
    import axios from "axios";
    import { onMount, tick, beforeUpdate } from "svelte";
    import { afterNavigate, goto } from "$app/navigation";
    import { authStatus } from "$lib/store";

    import SeoMeta from "$lib/components/SeoMeta.svelte";
    import { page } from "$app/stores";

    import { invalidateAll } from "$app/navigation";
    import { back_api } from "$lib/const";

    let chkModalVal = false;
    let pwdVal;
    let postNum = 10;
    let listStatus = true;

    export let data;

    let seoValue = {
        title: data.siteName,
        description:
            "건강,연예,맛집,분양 등 다양한 정보를 전하는 두꺼비 블로그",
        keywords: "건강,연예,맛집,분양",
        url: $page.url.origin,
        image: `${$page.url.origin}/logo.png`,
        published_time: "2023-4-29T05:48:25+00:00",
        modified_time: "2023-6-26T09:39:40+00:00",
    };

    afterNavigate(() => {
        invalidateAll();
    });

    async function goWrite(e) {
        try {
            await axios.post(`${back_api}`, { pwdVal }).then((res) => {
                if (res.data.validPassword) {
                    $authStatus = "ok";
                    alert("인증 완료! 글쓰기로 넘어갑니다!");
                    goto("/write");
                } else {
                    alert("인증 실패 비밀번호를 확인해주세요!");
                    chkModalVal = false;
                    pwdVal = "";
                }
            });
        } catch (error) {
            // console.error(error.message);
        }
    }

    function chkModalOpen() {
        if (!$authStatus || $authStatus != "ok") {
            chkModalVal = !chkModalVal;
        } else if ($authStatus == "ok") {
            alert("인증 완료! 글쓰기로 넘어갑니다!");
            goto("/write");
        }
    }

    async function addPostList() {
        axios
            .post(
                `${back_api}/add_post_list`,
                { postNum }
            )
            .then((res) => {
                const addData = res.data.posts;
                const addStatus = res.data.listStatus;
                data.posts = [...data.posts, ...addData];
                postNum = postNum + 10;
                listStatus = addStatus;
            })
            .catch((err) => {
                console.error(err.message);
            });
    }

</script>

<svelte:head>
    {#if $page.url.pathname == "/"}
        <SeoMeta bind:seoValue />
    {/if}
</svelte:head>

<div class="max_screen mx-auto px-2 pb-8 mt-2">
    <h1 class="sr-only">{data.siteName}</h1>
    <div class="my-6 kbo-font text-2xl text-gray-700 text-center relative">
        <div class="absolute right-0 suit-font text-sm">
            <button class="" style="top: -20px" on:click={chkModalOpen}
                >
                글추가하기
            </button>
            <!-- <button on:click={async () => {
                const res = await axios.get(`${back_api}/testppp`)
                console.log(res.data);
                
            }}>
                체크체크!
            </button> -->
        </div>

        두꺼비 최신글 리스트
    </div>

    {#each data.posts as post}
        <a data-sveltekit-reload href="/view/{post.bo_id}">
            <div
                class="flex h-26 overflow-hidden border border-gray-300 rounded-lg mb-2 suit-font"
            >
                <div
                    class="float-left w-2/6"
                    style="max-width: 220px; max-height:100px;"
                >
                    <div
                        class="h-full flex items-center justify-center overflow-hidden"
                    >
                        <img src={post.img_link} alt="asdfasdf" />
                    </div>
                </div>

                <div
                    class=" w-4/6 px-4 py-1 flex flex-col justify-center gap-2 text-sm"
                >
                    <div>
                        <span class="font-semibold text-base truncate">
                            {post.bo_subject}
                        </span>
                        <span class="text-xs text-gray-600"
                            >{post.bo_category} / {post.date_str}
                        </span>
                    </div>
                    <div class="h-10 text-ellipsis overflow-hidden box-over">
                        {post.text}
                    </div>
                </div>
            </div>
        </a>
    {/each}

    {#if listStatus}
        <div class="text-center mt-6">
            <button class=" text-5xl text-gray-500" on:click={addPostList}>
                <i class="fa-solid fa-circle-plus" />
            </button>
        </div>
    {/if}
</div>

<Modal bind:open={chkModalVal} size="xs" autoclose={false} class="w-full">
    <form class="flex flex-col space-y-6" on:submit|preventDefault={goWrite}>
        <span class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
            비밀번호를 입력하세요
        </span>
        <Label class="space-y-2">
            <span>password</span>
            <Input
                type="password"
                name="password"
                required
                bind:value={pwdVal}
            />
        </Label>
        <Button type="submit" class="w-full1">Login to your account</Button>
    </form>
</Modal>

<style>
    .box-over {
        /* 여러 줄 자르기 추가 스타일 */
        white-space: normal;
        text-align: left;
        word-wrap: break-word;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .sr-only {
        position: absolute;
        overflow: hidden;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        border: 0;
        clip: rect(0, 0, 0, 0);
    }
</style>
