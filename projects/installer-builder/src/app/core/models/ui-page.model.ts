export interface UINode {
    type: string;
    class?: string[];
    attrs?: Record<string, string>;
    styles?: Record<string, string>;
    text?: string;
    children?: UINode[];
}

export interface UIPage {
    styles: {
        global: Record<string, Record<string, string>>;
    };
    root: UINode;
}
