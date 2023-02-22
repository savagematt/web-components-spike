import {Browser} from "./browser/Browser";
import {server} from "./server";
import {HTMLElement} from "happy-dom";
import {expect} from "chai";

const browser = Browser.create(window => [
        {
            tag: "my-tag",
            element: class extends HTMLElement {
                connectedCallback() {
                    window.document.getElementById("my-button")!.innerHTML = "working"
                }
            }
        }],
    server()
);


describe("The thing", function () {
    it('should ', async function () {
        await browser.navigate("/");
        console.log(browser.debug());
        const button = await browser.elementById("my-button");
        expect(button.innerHTML).eq("working")
    });
})