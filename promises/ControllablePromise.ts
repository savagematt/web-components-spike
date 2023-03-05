// @ts-ignore
import p from 'promises-aplus-tests'
import {TrackablePromise} from "./TrackablePromise";

export class ControllablePromise<T> extends TrackablePromise<T> {
    readonly [Symbol.toStringTag]: string = "ControllablePromise";

    private constructor(p: Promise<T>, readonly releaseSignal: () => void) {
        super(p);
    }

    static of<T>(wrapped: Promise<T>): ControllablePromise<T> {
        if (wrapped instanceof ControllablePromise)
            return wrapped;

        let release: () => void;
        const controller = new Promise<void>(resolve => release = resolve);
        return new ControllablePromise<T>(controller.then(_ => wrapped), release!);
    }

    release(): Promise<T> {
        this.releaseSignal();
        return this;
    }

    async allSideEffectsFinished(): Promise<T> {
        this.releaseSignal();
        return super.allSideEffectsFinished();
    }
}


export function controllable<T>(p: Promise<T>): ControllablePromise<T> {
    return ControllablePromise.of(p);
}

export type ControlledFn<T extends (...args: any) => Promise<any>> =
    (...args: Parameters<T>) => ControllablePromise<Awaited<ReturnType<T>>>;

export type ControllableFn<T extends (...args: any) => Promise<any>> =
    ControlledFn<T>
    & {
    pause(): void;
    unpause(): Promise<ReturnType<T>[]>;
    release(): Promise<ReturnType<T>[]>;
    allSideEffectsFinished(): Promise<ReturnType<T>[]>;
};

export function controllableFn<T extends (...args: Parameters<T>) => Promise<any>>(f: T): ControllableFn<T> {
    const inFlight: ControllablePromise<ReturnType<T>>[] = [];
    let paused = true;
    const fn = (...args: Parameters<T>) => {
        const p = controllable(f(...args));
        if (paused) {
            inFlight.push(p);
        } else {
            p.releaseSignal();
        }
        return p;
    };
    fn.release = () => {
        const result = Promise.all(inFlight.map(p => p.release()));
        inFlight.length = 0;
        return result
    }
    fn.pause = () => {
        paused = true;
    }
    fn.allSideEffectsFinished = () => fn.release().then(() => Promise.all(inFlight.map(p => p.allSideEffectsFinished())))
    fn.unpause = () => {
        paused = false;
        return fn.release();
    }
    return fn;
}



