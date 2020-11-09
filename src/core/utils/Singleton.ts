export class Singleton {
    static _instance: Singleton;

    constructor(constructor: Function & { _instance: any }) {
        if (constructor._instance == null) {
            constructor._instance = this;
        }

        return constructor._instance;
    }
}
