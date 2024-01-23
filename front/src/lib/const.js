// place files you want to import through the `$lib` alias in this folder.

// 건강정보,연예정보,맛집정보,분양정보,기타정보
export const category_list = [
    { link: 'health', name: '건강정보' },
    { link: 'enter', name: '연예정보' },
    { link: 'food', name: '맛집정보' },
    { link: 'land', name: '분양정보' },
    { link: 'etc', name: '기타정보' },
]

export const sub_api = import.meta.env.VITE_TEST_SERVER_URL

export const back_api = import.meta.env.VITE_SERVER_URL + '/api/v7'