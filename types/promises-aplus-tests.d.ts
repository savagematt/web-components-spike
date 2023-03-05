declare module 'promises-aplus-tests' {
    type Adapter = {
        resolved?: <T>(value: T) => Promise<T>;
        rejected?: <T>(reason: any) => Promise<T>;
        deferred: <T>() => {
            promise: Promise<T>,
            resolve: (value: T | PromiseLike<T>) => void,
            reject: (reason?: any) => void
        };
    }

    function mocha(adapter: Adapter)
}