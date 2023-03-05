import {HappyDomBrowser, PortableWebComponent} from "./browser/HappyDomBrowser";
import {server} from "./server";
import {expect} from "chai";
import {PointlessForm} from "./components/PointlessForm";
import {controllableFn} from "./promises/ControllablePromise";


// export class TestScheduler implements Scheduler {
//
//     waitForAsync(): Promise<void> {
//
//     }
//
//     register<T>(p: Promise<T>): Promise<T> {
//         return;
//     }
//
//     timeout(ms: number): Promise<void> {
//         return Promise.resolve(undefined);
//     }
// }


const elements: PortableWebComponent[] = [PointlessForm];
// index.ts
// elements.forEach(e => window.customElements.define(e.tag, e.element({window, htmlElement: HTMLElement, fetch})))


describe("Home page", function () {
    it('The pointless button should be pointless', async function () {
        const backend = controllableFn(server());
        await backend.unpause();

        const browser = HappyDomBrowser.create(
            {
                customElements: elements,
                server: backend
            }
        );

        await browser.navigate("/");

        const textInput = await browser.select<HTMLInputElement>("input");
        textInput.value = "world"

        let button = await browser.select<HTMLButtonElement>("#my-button");
        button.click();

        await backend.allSideEffectsFinished();

        button = await browser.select<HTMLButtonElement>("#my-button");
        expect(button.value).eq("hello world")
    });
})