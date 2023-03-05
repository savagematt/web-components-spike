import * as elements from "typed-html";
import {ssrComponent, SsrPortableWebComponent} from "../browser/HappyDomBrowser";

declare global {
    namespace JSX {
        interface MyTag {
        }

        interface IntrinsicElements {
            "my-tag": MyTag;
        }
    }
}

export const PointlessForm: SsrPortableWebComponent<[string]> = ssrComponent(
    "my-tag",

    (text: string) => <my-tag>
        <input name="greeting"/>
        <button id="my-button"/>
    </my-tag>,

    ({htmlElement, window, fetch}) =>
        class extends htmlElement {
            connectedCallback() {
                this.querySelector("button")!
                    .addEventListener("click", ev => {
                        fetch("/api/hello?me=" + this.querySelector("input")!.value)
                            .then(async res => {
                                const message = await res.text();

                                const button = window.document.querySelector("#my-button") as HTMLButtonElement;
                                return button.value = message;
                            })
                    })
            }
        });