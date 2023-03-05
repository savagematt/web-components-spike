// @ts-ignore
import p from "promises-aplus-tests";
import {trackable} from "./TrackablePromise";

describe("TrackablePromise", function (){
    p.mocha({
        deferred: <T>() => {
            let resolve: (value: T | PromiseLike<T>) => void;
            let reject: (reason?: any) => void;

            const promise = trackable<T>(new Promise((resolve1, reject1) => {
                resolve = resolve1;
                reject = reject1;
            }));
            return {
                promise,
                resolve: resolve!,
                reject: reject!
            }
        }
    });
})
