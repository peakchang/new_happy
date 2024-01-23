<script>
    // 테스트용 배열
    const myArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    // 함수 호출
    const result = shuffleArray(myArray);

    // 결과 출력
    console.log(result);


    function shuffleArray(arr) {
        // 배열의 길이가 10 이하인 경우, 배열을 그대로 반환
        if (arr.length <= 10) {
            return arr;
        }

        // 10에서 13 사이의 랜덤한 개수를 선택
        const numToSelect = Math.floor(Math.random() * 4) + 10;

        // 배열을 복제하여 원본 배열을 변경하지 않도록 함
        const clonedArr = [...arr];

        // 배열을 랜덤하게 섞음
        for (let i = clonedArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [clonedArr[i], clonedArr[j]] = [clonedArr[j], clonedArr[i]];
        }

        // 선택된 개수만큼 요소를 잘라냄
        const selectedArr = clonedArr.slice(0, numToSelect);

        return selectedArr;
    }
</script>
