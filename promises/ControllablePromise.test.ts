// @ts-ignore
import p from "promises-aplus-tests";
import {controllable} from "./ControllablePromise";

describe("ControllablePromise", function () {
    p.mocha({
        deferred: <T>() => {
            let resolve: (value: T | PromiseLike<T>) => void;
            let reject: (reason?: any) => void;

            const promise = controllable<T>(new Promise((resolve1, reject1) => {
                resolve = resolve1;
                reject = reject1;
            }));
            promise.releaseSignal();
            return {
                promise,
                resolve: resolve!,
                reject: reject!
            }
        }
    });
})
