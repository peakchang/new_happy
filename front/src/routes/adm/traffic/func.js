import { addTrafficVal } from "$lib/store.js";
import axios from "axios";
import { back_api } from "$lib/const";

export const makeNewTrafficWork = async () => {
    console.log(addTrafficVal);

    let add_traffic_val = {}
    addTrafficVal.subscribe((val) => {
        add_traffic_val = val;
    })

    const res = await axios.post(`${back_api}/traffic_work/make_new_tarffic`, add_traffic_val)
    if (res.data.status) {
        return true
    } else {
        return false
    }
}