<script>
	import "$src/app.pcss";
	import DrawerCustom from "$lib/components/design/DrawerCustom.svelte";
	import { admin_sidebar, admin_sidebar_width } from "$src/lib/store";

	let innerWidth;
	const width = 208;

	$: {
		if (innerWidth < 1000) {
			$admin_sidebar = false;
			$admin_sidebar_width = false;
		} else {
			$admin_sidebar = true;
			$admin_sidebar_width = true;
		}
	}

	function changeDrawerOpt(bool) {}

	// 바탕을 클릭하면 액션을 줄지 말지
	let activateClickOutside = false;

	// 바탕을 클릭하면 drawer을 닫을지 말지
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

<svelte:window bind:innerWidth />

<div
	class="fixed top-0 left-0 w-full bg-stone-300 py-2 px-6 suit-font z-30 flex items-center pretendard"
	class:ml-52={$admin_sidebar && $admin_sidebar_width}
>
	<button on:click={() => ($admin_sidebar = !$admin_sidebar)}>
		<i class="fa fa-bars" aria-hidden="true"></i>
	</button>

	<a href="/" class="ml-10">
		<i class="fa fa-home text-xl" aria-hidden="true"></i>
	</a>

	<a href="/" class="ml-2"> 로그아웃 </a>
</div>

<DrawerCustom drawerOpen={$admin_sidebar} bgGray={false} {width}>
	<div class="flex justify-between mb-5">
		<div>Admin</div>
		<div>
			<button
				on:click={() => {
					$admin_sidebar = false;
				}}
			>
				<i class="fa fa-times" aria-hidden="true"></i>
			</button>
		</div>
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

	<a href="/adm/cafeworklist">
		<div class="p-2 hover:bg-gray-100 rounded-md mb-1">
			<span class="mr-2">
				<i class="fa fa-file-text" aria-hidden="true"></i>
			</span>
			<span class="text-sm"> 카페 작업내역 </span>
		</div>
	</a>

	<a href="/adm/cafe_reply">
		<div class="p-2 hover:bg-gray-100 rounded-md mb-1">
			<span class="mr-2">
				<i class="fa fa-commenting" aria-hidden="true"></i>
			</span>
			<span class="text-sm"> 카페 댓글 </span>
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

	<a href="/adm/traffic">
		<div class="p-2 hover:bg-gray-100 rounded-md mb-1">
			<span class="mr-2">
				<i class="fa fa-car" aria-hidden="true"></i>
			</span>
			<span class="text-sm"> 트래픽</span>
		</div>
	</a>
</DrawerCustom>

<div
	class="mt-14 px-2 text-sm suit-font"
	class:ml-52={$admin_sidebar && $admin_sidebar_width}
>
	<slot />
</div>

<style>
	:global(.suit-font) {
		font-family: "SUIT";
	}
</style>
