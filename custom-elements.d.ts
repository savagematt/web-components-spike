declare global {
    namespace JSX {
        interface MyTag {
        }
        interface IntrinsicElements {
            "my-tag": MyTag;
        }
    }
}