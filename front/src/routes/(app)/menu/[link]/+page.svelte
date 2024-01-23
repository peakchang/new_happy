<script>
    import { page } from "$app/stores";
    import SeoMeta from "$lib/components/SeoMeta.svelte";
    import {
        afterNavigate,
        beforeNavigate,
        invalidate,
        invalidateAll,
    } from "$app/navigation";

    // invalidate 를 사용할때에는 인자로 링크가 들어가야함

    export let data;
    console.log(data);

    let cateName;
    let postList = [];
    for (let i = 0; i < data.category_list.length; i++) {
        if (data.category_list[i].link === $page.params.link) {
            cateName = data.category_list[i].name;
        }
    }

    afterNavigate(() => {
        invalidateAll();
        postList = [...data.posts].reverse();

        for (let i = 0; i < data.category_list.length; i++) {
        if (data.category_list[i].link === $page.params.link) {
            cateName = data.category_list[i].name;
        }
    }

        console.log(cateName);
    });

    let seoValue = {
        title: `행복 가득 두꺼비 - ${cateName}`,
        description: "건강,연예,맛집,분양 등 다양한 정보를 전하는 두꺼비 블로그",
        keywords: "건강,연예,맛집,분양",
        url: $page.url.origin,
        image: `${$page.url.origin}/logo.png`,
        published_time: "2023-4-29T05:48:25+00:00",
        modified_time: "2023-6-26T09:39:40+00:00",
    };
</script>

<svelte:head>
    {#if $page.url.pathname.includes("menu")}
        <SeoMeta bind:seoValue />
    {/if}
</svelte:head>

<div class="max_screen mx-auto px-2 pb-8 mt-2">
    <h1 class="sr-only">{data.siteName} - {cateName}</h1>
    <div class="my-6 kbo-font text-2xl text-gray-700 text-center relative">
        {cateName} 최신글 리스트
    </div>

    {#each postList as val}
        <a data-sveltekit-reload href="/view/{val.bo_id}">
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
                        <img src={val.img_link} alt="asdfasdf" />
                    </div>
                </div>

                <div
                    class=" w-4/6 px-4 py-1 flex flex-col justify-center gap-2 text-sm"
                >
                    <div>
                        <span class="font-semibold text-base truncate">
                            {val.bo_subject}
                        </span>
                        <span class="text-xs text-gray-600"
                            >{val.bo_category} / {val.date_str}
                        </span>
                    </div>
                    <div class="h-10 text-ellipsis overflow-hidden box-over">
                        {val.text}
                    </div>
                </div>
            </div>
        </a>
    {/each}
</div>


<style>
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