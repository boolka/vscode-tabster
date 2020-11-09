import { HOT_SET_LABEL_1 } from "./consts";
import { THotLabel } from "./models";

export function isHotLabel(key: THotLabel | string): boolean {
    for (let i = 0; i < 10; ++i) {
        if (key === `${HOT_SET_LABEL_1.slice(0, -1)}${i}`) {
            return true;
        }
    }

    return false;
}

export function getLabelSortOrder(key: THotLabel) {
    return Number(key.slice(-1));
}
