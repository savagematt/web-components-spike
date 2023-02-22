import {HTMLElement, IElement, Window} from "happy-dom";
import {RealLocation} from "./RealLocation";

export type Server = typeof fetch;

export class Browser {
    private constructor(private readonly window: Window, private readonly server: Server) {

    }

    static create(customElements: (window: Window) => CustomElement[], server: Server) {
        const window = new Window();
        // @ts-ignore
        window['location'] = new RealLocation(server, window);

        customElements(window).forEach(e => {
            window.customElements.define(e.tag, e.element as any)
        })
        return new Browser(window, server);
    }

    async navigate(url: string): Promise<this> {
        this.window.location.assign(url)
        const response = await this.server(url);
        this.window.document.write(await response.text())
        await this.window.happyDOM.whenAsyncComplete();
        return this;
    }


    async elementById(id: string): Promise<IElement> {
        await this.window.happyDOM.whenAsyncComplete()
        return this.window.document.getElementById(id);
    }

    debug(): string {
        return this.window.document.documentElement.innerHTML;
    }
}

export type CustomElement<T extends typeof HTMLElement = typeof HTMLElement> = {
    tag: string,
    element: T
}