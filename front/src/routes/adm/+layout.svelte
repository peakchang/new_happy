<script>
	import {
		Drawer,
		Button,
		CloseButton,
		Sidebar,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper,
		SidebarDropdownWrapper,
		SidebarDropdownItem,
	} from "flowbite-svelte";
	import { sineIn } from "svelte/easing";
	import "$src/app.pcss";

	import { admin_sidebar } from "$src/lib/store";

	// 바탕을 클릭하면 액션을 줄지 말지
	let activateClickOutside = false;

	// 바탕을 클릭하면 drawer을 닫을지 말지
	let backdrop = false;

	let transitionParams = {
		x: -320,
		duration: 200,
		easing: sineIn,
	};
</script>

<svelte:head>
	<!-- SUIT 폰트 CSS -->
	<link
		href="https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/static/woff2/SUIT.css"
		rel="stylesheet"
	/>
	<link
		rel="stylesheet"
		href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
	/>
</svelte:head>

<div
	class="fixed top-0 left-0 w-full bg-stone-300 py-2 px-6 suit-font flex items-center z-50"
	class:ml-52={!$admin_sidebar}
>
	<button on:click={() => ($admin_sidebar = !$admin_sidebar)}>
		<svg
			class="w-6 h-6 text-gray-800 dark:text-white"
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-width="2"
				d="M5 7h14M5 12h14M5 17h10"
			/>
		</svg>
	</button>

	<a href="/" class="ml-5">
		<svg
			class="w-5 h-5 text-gray-800 dark:text-white"
			fill="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				fill-rule="evenodd"
				d="M11.3 3.3a1 1 0 0 1 1.4 0l6 6 2 2a1 1 0 0 1-1.4 1.4l-.3-.3V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3c0 .6-.4 1-1 1H7a2 2 0 0 1-2-2v-6.6l-.3.3a1 1 0 0 1-1.4-1.4l2-2 6-6Z"
				clip-rule="evenodd"
			/>
		</svg>
	</a>

	<a href="/" class="ml-5"> 로그아웃 </a>
</div>

<Drawer
	{activateClickOutside}
	{backdrop}
	transitionType="fly"
	{transitionParams}
	bind:hidden={$admin_sidebar}
	class="border-r border-stone-200 suit-font w-52 z-40"
>
	<div class="flex items-center">
		<h5
			id="drawer-label"
			class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"
		>
			메뉴
		</h5>
		<CloseButton
			on:click={() => ($admin_sidebar = true)}
			class="mb-4 dark:text-white"
		/>
	</div>

	<a href="/adm">
		<div class="p-2 hover:bg-gray-100 rounded-md mb-1">
			<span class="mr-1">
				<i class="fa fa-cog" aria-hidden="true"></i>
			</span>
			<span> 기본설정 </span>
		</div>
	</a>

	<a href="/adm/setting">
		<div class="p-2 hover:bg-gray-100 rounded-md mb-1">
			<span class="mr-3">
				<i class="fa fa-mobile text-xl" aria-hidden="true"></i>
			</span>
			<span> 설정 </span>
		</div>
	</a>

	<a href="/adm/target">
		<div class="p-2 hover:bg-gray-100 rounded-md mb-1">
			<span class="mr-1">
				<i class="fa fa-bullseye" aria-hidden="true"></i>
			</span>
			<span> 타겟 링크 </span>
		</div>
	</a>

	<a href="/adm/backlinks">
		<div class="p-2 hover:bg-gray-100 rounded-md mb-1">
			<span class="mr-1">
				<i class="fa fa-cubes" aria-hidden="true"></i>
			</span>
			<span> 백링크 </span>
		</div>
	</a>

	<a href="/adm/worklist">
		<div class="p-2 hover:bg-gray-100 rounded-md mb-1">
			<span class="mr-2">
				<i class="fa fa-clipboard" aria-hidden="true"></i>
			</span>
			<span class="text-sm"> 백링크 작업내역 </span>
		</div>
	</a>

	<a href="/adm/cafelist">
		<div class="p-2 hover:bg-gray-100 rounded-md mb-1">
			<span class="mr-1">
				<i class="fa fa-coffee" aria-hidden="true"></i>
			</span>
			<span> 카페 리스트 </span>
		</div>
	</a>

	<a href="/adm/cafelist">
		<div class="p-2 hover:bg-gray-100 rounded-md mb-1">
			<span class="mr-2">
				<i class="fa fa-file-text" aria-hidden="true"></i>
			</span>
			<span class="text-sm"> 카페 작업내역 </span>
		</div>
	</a>

	

	<a href="/adm/nwork">
		<div class="p-2 hover:bg-gray-100 rounded-md mb-1">
			<span class="mr-2">
				<i class="fa fa-universal-access" aria-hidden="true"></i>
			</span>
			<span class="text-sm"> N작업</span>
		</div>
	</a>
</Drawer>

<div class="mt-14 px-5 text-sm suit-font mb-20" class:ml-52={!$admin_sidebar}>
	<slot />
</div>

<style>
	:global(.suit-font) {
		font-family: "SUIT";
	}
</style>
