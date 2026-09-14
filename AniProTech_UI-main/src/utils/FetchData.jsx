import { transformToUpdatePayload } from "./common";
import { showError } from "./toaster";

export const fetchData = async (apiFunc, setData, setLoading, setGlobalData, payload = null, shouldTransform = false) => {
    if (setLoading) setLoading(true);
    try {
        // const formattedPayload = payload && shouldTransform ? transformToUpdatePayload(payload) : payload;
        const formattedPayload = payload;

        const response = await apiFunc(formattedPayload);
        const result = response?.data?.results?.data || null;

        if (setData) setData(result);
        if (setGlobalData) setGlobalData(result);

        return response;
    } catch (e) {
        console.log("e", e);
        const message = e?.response?.data?.message || "Network Error, please try again later.";
        showError(message);
        return null;
    } finally {
        setTimeout(() => {
            if (setLoading) setLoading(false);
        }, 1000);
    }
};
