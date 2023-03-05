import {Server} from "./browser/HappyDomBrowser";
import {PointlessForm} from "./components/PointlessForm";


export function server(): Server {
    return async request => {

        if (typeof request === "string" && request === "/")
            return new Response(PointlessForm.ssr("ignored"), {status: 200});

        if (typeof request === "string" && request.startsWith("/api/hello"))
            return new Response("hello " + new URL("http://whatever" + request).searchParams.get("me"), {status: 200});

        console.error("404", request);

        return new Response(null, {status: 404})
    };
}
