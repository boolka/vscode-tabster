import { TABSTER_ERROR_PREFIX } from "../consts";
import { Logger } from "./Logger";

const logger = new Logger();

function logError(
    prefix: string,
    className: string,
    methodName: string,
    err: any,
) {
    if (err instanceof Error) {
        logger.log(
            `${prefix}_${className}#${methodName}: "${err.message}"\n${err.stack}`,
        );
    } else {
        logger.log(`${prefix}_${className}#${methodName}: "${err}`);
    }
}

export function AsyncErrorBoundary(descriptors: string[]) {
    return function (constructor: any) {
        descriptors.forEach((descriptor) => {
            const originalFunction = constructor.prototype[descriptor];

            constructor.prototype[descriptor] = async function (
                ...args: any[]
            ) {
                try {
                    return await originalFunction.call(this, ...args);
                } catch (err) {
                    logError(
                        TABSTER_ERROR_PREFIX,
                        constructor.name,
                        descriptor,
                        err,
                    );

                    throw err;
                }
            };
        });

        return constructor;
    };
}

export function ErrorBoundary(descriptors: string[]) {
    return function (constructor: any) {
        descriptors.forEach((descriptor) => {
            const originalFunction = constructor.prototype[descriptor];

            constructor.prototype[descriptor] = function (...args: any[]) {
                try {
                    return originalFunction.call(this, ...args);
                } catch (err) {
                    logError(
                        TABSTER_ERROR_PREFIX,
                        constructor.name,
                        descriptor,
                        err,
                    );

                    throw err;
                }
            };
        });

        return constructor;
    };
}
