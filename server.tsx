import * as elements from "typed-html";
import {Server} from "./browser/Browser";

declare global {
    namespace JSX {
        interface MyTag {
        }
        interface IntrinsicElements {
            "my-tag": MyTag;
        }
    }
}

export function server(): Server {
    return async _input => {
        return new Response(<my-tag>
            <button id="my-button"></button>
        </my-tag>, {status: 200});
    };
}