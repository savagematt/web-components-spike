import {BrowserEnvironment} from "./browser/HappyDomBrowser";

/**
 * A WebComponent that can be registered in a browser, or in HappyDom, or wherever
 *
 * In the browser we'd use them like this:
 *
 * window.customElements.define(e.tag, e.element({window, htmlElement: HTMLElement, fetch})))
 */
export type PortableWebComponent<Element extends typeof HTMLElement = typeof HTMLElement> = {
    tag: string,
    element: (environment: BrowserEnvironment) => Element
}

export function component<Element extends typeof HTMLElement = typeof HTMLElement>(
    tag: string,
    element: (environment: BrowserEnvironment) => Element)
    : PortableWebComponent<Element> {
    return {tag, element}
}

export type SsrPortableWebComponent<Args extends any[], Element extends typeof HTMLElement = typeof HTMLElement> =
    PortableWebComponent<Element> &
    {
        ssr: (...args: Args) => string
    }

export function ssrComponent<Args extends any[], Element extends typeof HTMLElement = typeof HTMLElement>(
    tag: string,
    ssr: (...args: Args) => string,
    element: (environment: BrowserEnvironment) => Element)
    : SsrPortableWebComponent<Args, Element> {
    return {...component(tag, element), ssr};
}