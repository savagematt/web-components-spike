import {Location, Window} from "happy-dom";
import {Server} from "./HappyDomBrowser";

export class RealLocation extends URL implements Location {
    constructor(
        private readonly server: Server,
        private readonly window: Window) {
        super("about:blank")
    }

    /**
     * Replaces the current resource with the one at the provided URL. The difference from the assign() method is that
     * after using replace() the current page will not be saved in session History, meaning the user won't be able to
     * use the back button to navigate to it.
     *
     * @param url URL.
     */
    public replace(url: string): void {
        //TODO: sensible url
        this.href = "http://localhost" + url;
        this.server(url).then(res => {
            res.text()
                .then(html =>
                    this.window.document.write(html));
        })
    }

    /**
     * Loads the resource at the URL provided in parameter.
     *
     * @param url
     * @see this.replace()
     */
    public assign(url: string): void {
        this.replace(url);
    }

    /**
     * Reloads the resource from the current URL.
     *
     * Note: Will do nothing as reloading is not supported in server-dom.
     */
    public reload(): void {
        // Do nothing
    }
}