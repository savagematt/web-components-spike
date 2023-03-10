import {HTMLElement as HappyDomElement, Window as HappyDomWindow} from "happy-dom";
import {RealLocation} from "./RealLocation";
import {PortableWebComponent} from "../PortableWebComponent";

export type Server = typeof fetch;

export type HappyDomBrowserOpts = {
    customElements: PortableWebComponent[];
    server: Server;
}

export class HappyDomBrowser {
    private constructor(private readonly window: HappyDomWindow, private readonly server: Server) {

    }

    static create({customElements, server}: HappyDomBrowserOpts) {
        const window = new HappyDomWindow();
        // @ts-ignore
        window['location'] = new RealLocation(server, window);

        const env: BrowserEnvironment = {
            htmlElement: HappyDomElement as any,
            window: window as any,
            fetch: server
        }

        customElements.forEach(e => {
            window.customElements.define(e.tag, e.element(env) as any)
        })
        return new HappyDomBrowser(window, server);
    }

    async navigate(url: string): Promise<this> {
        this.window.location.assign(url)
        const response = await this.server(url);
        this.window.document.write(await response.text())
        await this.window.happyDOM.whenAsyncComplete();
        return this;
    }


    async select<T extends HTMLElement = HTMLElement>(selector: string): Promise<T> {
        await this.window.happyDOM.whenAsyncComplete()
        return this.window.document.querySelector(selector) as any as T;
    }

    async selectAll<T extends HTMLElement = HTMLElement>(selector: string): Promise<T[]> {
        await this.window.happyDOM.whenAsyncComplete()
        return this.window.document.querySelectorAll(selector) as any as T[];
    }

    debug(): string {
        return this.window.document.documentElement.innerHTML;
    }
}

export type BrowserEnvironment = {
    htmlElement: typeof HTMLElement;
    window: Window;
    fetch: typeof fetch;
}


