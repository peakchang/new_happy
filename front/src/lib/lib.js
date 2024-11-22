import { goto } from '$app/navigation';

// Helper 함수: URL을 업데이트하는 공통 함수
function updateUrl(searchParams) {
    const currentUrl = new URL(window.location.href);
    currentUrl.search = searchParams.toString();
    goto(currentUrl.pathname + currentUrl.search, { replaceState: true, invalidateAll: true });
}

// 파라미터 추가 또는 수정
export function setParams(params, clear = false) {
    const currentUrl = new URL(window.location.href);
    const searchParams = new URLSearchParams(clear ? '' : currentUrl.search); // clear가 true면 초기화

    // 새로운 파라미터 추가
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) {
            searchParams.delete(key); // null 또는 undefined는 삭제
        } else {
            searchParams.set(key, value.toString()); // 값 추가
        }
    }

    // URL 갱신
    currentUrl.search = searchParams.toString();
    console.log('Updated URL:', currentUrl.toString()); // 디버깅용

    // URL 변경
    goto(currentUrl.pathname + currentUrl.search, { replaceState: true, invalidateAll: true });
}



// 파라미터 삭제
export function deleteParam(key) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete(key);
    updateUrl(searchParams);
}

// 파라미터 초기화
export function clearParams() {
    const currentUrl = new URL(window.location.href);
    updateUrl(new URLSearchParams()); // 빈 searchParams로 설정
}




export function getPagination(currentPage, maxPage = 30) {
    const range = 7; // 보여줄 페이지 범위
    const halfRange = Math.floor(range / 2);

    let start = Math.max(1, currentPage - halfRange);
    let end = Math.min(maxPage, currentPage + halfRange);

    // Adjust start and end if the range is less than 7
    if (end - start < range - 1) {
        if (start === 1) {
            end = Math.min(maxPage, start + range - 1);
        } else if (end === maxPage) {
            start = Math.max(1, end - range + 1);
        }
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}