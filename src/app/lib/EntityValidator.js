import { EntityLocalCheck } from "./EntityValidatorHelper/EntityLocalCheck";
import { EntityApi } from "./EntityValidatorHelper/EntityApi";

export async function EntityValidator(email) {
    const localResult = await EntityLocalCheck(email);
    if (!localResult.success) return localResult;

    return await EntityApi(email);
}
