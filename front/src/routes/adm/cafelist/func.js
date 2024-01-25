import axios from "axios";
import { back_api } from "$lib/const";


export const updateNewCafe = async (e, addCafeLink, addCafeName, addCafeNum) => {
    let result = { status: true, message: '업데이트가 완료 되었습니다.' }

    try {
        const res = await axios.post(`${back_api}/cafe_work/add_cafe`, {
            cl_link: addCafeLink,
            cl_board_name: addCafeName,
            cl_board_num: addCafeNum
        })

        console.log(res);
        if (res.data.status) {
            return result;
        } else {
            result = { status: false, message: '에러가 발생했습니다. 다시 시도해주세요' }
            return result;
        }
    } catch (error) {

    }

}

export const updateCafeList = async (e, checkedList, cafeList) => {
    console.log(checkedList.length);
    if (checkedList.length == 0) {
        alert('업데이트 할 항목을 선택해주세요')
        return false;
    }
    let updateList = [];
    for (let i = 0; i < checkedList.length; i++) {
        const num = checkedList[i];
        updateList.push(cafeList[num])
    }

    try {
        const res = await axios.post(`${back_api}/cafe_work/update_cafe_list`, { updateList })
        return res.status
    } catch (error) {
        return false;
    }
}

export const deleteCafeList = async (e, checkedList, cafeList) => {
    if (checkedList.length == 0) {
        alert('삭제할 항목을 선택해주세요')
        return false;
    }

    if (!confirm('삭제된 자료는 복구가 불가능합니다. 진행 하시겠습니까?')) {
        return false;
    }


    let deleteList = [];
    for (let i = 0; i < checkedList.length; i++) {
        const num = checkedList[i];
        deleteList.push(cafeList[num]['cl_id'])
    }

    console.log(deleteList);

    try {
        const res = await axios.post(`${back_api}/cafe_work/delete_cafe_list`, { deleteList })
        return res.status
    } catch (error) {
        return false;
    }
}