<script lang="ts">
    export let seoValue;
</script>

<title>{seoValue.title}</title>
<meta name="title" content={seoValue.title} />
<meta name="description" content={seoValue.description} />
<meta name="keywords" content={seoValue.keywords} />

<meta name="NaverBot" content="All" />
<meta name="NaverBot" content="index,follow" />
<meta name="Yeti" content="All" />
<meta name="Yeti" content="index,follow" />
<meta name="robots" content="max-image-preview:large" />
<meta name="generator" content="All in One SEO (AIOSEO) 4.2.3.1 " />

<meta itemprop="name" content={seoValue.title} />
<meta itemprop="image" content={seoValue.image} />
<meta itemprop="description" content={seoValue.description} />
<meta itemprop="url" content={seoValue.url} />
<meta itemprop="keywords" content={seoValue.keywords} />

<meta property="article:published_time" content={seoValue.published_time} />
{#if seoValue.modified_time}
    <meta property="article:modified_time" content={seoValue.modified_time} />
{/if}
<meta name="og:locale" content="ko_KR" />

<meta property="og:title" content={seoValue.title} />
<meta property="og:url" content={seoValue.url} />
<meta property="og:type" content="website" />
<meta property="og:description" content={seoValue.description} />
<meta property="og:image" content={seoValue.image} />
<meta property="og:site_name" content={seoValue.title} />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={seoValue.title} />
<meta name="twitter:description" content={seoValue.description} />
<meta name="twitter:image" content={seoValue.image} />

<link rel="canonical" href={seoValue.url} />
<link rel="alternate" href={seoValue.url} hrefLang="ko" />

<meta
    name="google-site-verification"
    content="DKLFME3w4GLw_jvNp5ipT9agxOXRo7kzoobCs4Nas3E"
/>
<meta
    name="naver-site-verification"
    content="c1f4e3c9163bc8a646e12ead1d4f112d19586b51"
/>
