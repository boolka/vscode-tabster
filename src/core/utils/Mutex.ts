export function Mutex(descriptors: string[]) {
    return function (constructor: any) {
        descriptors.forEach((descriptor) => {
            let isLock = false;
            const originalFunction = constructor.prototype[descriptor];

            constructor.prototype[descriptor] = async function (
                ...args: any[]
            ) {
                if (!isLock) {
                    isLock = true;
                    const res = await originalFunction.call(this, ...args);
                    isLock = false;
                    return res;
                }
            };
        });

        return constructor;
    };
}
