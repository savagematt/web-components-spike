export class TrackablePromise<T = unknown> implements Promise<T> {
    readonly [Symbol.toStringTag]: string = "#<TrackablePromise>";
    private readonly children: TrackablePromise[] = []

    protected constructor(protected readonly wrapped: Promise<T>) {

    }

    static of<T = unknown>(wrapped: Promise<T>): TrackablePromise<T> {
        return wrapped instanceof TrackablePromise
            ? wrapped :
            new TrackablePromise(wrapped);
    }

    async allSideEffectsFinished(): Promise<T> {
        await Promise.all(this.children.map(p => p.allSideEffectsFinished()));
        return this.wrapped;
    }

    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => (PromiseLike<TResult1> | TResult1)) | undefined | null, onrejected?: ((reason: any) => (PromiseLike<TResult2> | TResult2)) | undefined | null): Promise<TResult1 | TResult2> {
        let promise: TrackablePromise<TResult1 | TResult2>;
        // See: https://github.com/promises-aplus/promises-tests/blob/master/lib/tests/2.3.1.js
        const checkForChainsInFulfilled: ((value: T) => (PromiseLike<TResult1> | TResult1)) | undefined | null =
            typeof onfulfilled === "function"
                ? value => {
                    const result = onfulfilled(value);
                    if (result === promise) throw new TypeError(`Chaining cycle detected for promise ${promise}`);
                    return result;
                }
                : onfulfilled;
        const checkForChainsInRejected: ((reason: any) => (PromiseLike<TResult2> | TResult2)) | undefined | null =
            typeof onrejected === "function"
                ? value => {
                    const result = onrejected(value);
                    if (result === promise) throw new TypeError(`Chaining cycle detected for promise ${promise}`);
                    return result;
                }
                : onrejected;
        promise = TrackablePromise.of(this.wrapped.then(checkForChainsInFulfilled, checkForChainsInRejected));
        this.children.push(promise);
        return promise;
    }

    catch<TResult = never>(onrejected?: ((reason: any) => (PromiseLike<TResult> | TResult)) | undefined | null): Promise<T | TResult> {
        const promise = TrackablePromise.of(this.wrapped.catch(onrejected));
        this.children.push(promise);
        return promise;
    }

    finally(onfinally?: (() => void) | undefined | null): Promise<T> {
        const promise = TrackablePromise.of(this.wrapped.finally(onfinally));
        this.children.push(promise);
        return promise;
    }
}

export function trackable<T>(p: Promise<T>): TrackablePromise<T> {
    return TrackablePromise.of(p);
}

export type TrackedFn<T extends (...args: any) => Promise<any>> =
    (...args: Parameters<T>) => TrackablePromise<Awaited<ReturnType<T>>>;

export type TrackableFn<T extends (...args: any) => Promise<any>> =
    TrackedFn<T>
    & {
    allSideEffectsFinished(): Promise<void>;
};

export function trackableFn<T extends (...args: Parameters<T>) => Promise<any>>(f: T): TrackableFn<T> {
    const inFlight: TrackablePromise<ReturnType<T>>[] = [];
    const fn = (...args: Parameters<T>) => {
        const p = trackable(f(...args));
        inFlight.push(p);
        return p;
    }
    fn.allSideEffectsFinished = async () => {
        const result = Promise.all(inFlight.map(p => p.allSideEffectsFinished()));
        inFlight.length = 0;
        await result;
    }
    return fn;
}
