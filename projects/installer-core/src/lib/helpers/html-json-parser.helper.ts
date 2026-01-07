import { UINode, UIPage } from '../models/ui-node.model';
import { ALLOWED_TAGS, AttrArrayExtension } from '../enums/prop-binding.enum';

export function parseCssToJson(cssText: string): Record<string, Record<string, string>> {
    const styles: Record<string, Record<string, string>> = {};

    // Xóa comment
    cssText = cssText.replace(/\/\*[\s\S]*?\*\//g, '');

    const blocks = cssText.match(/[^}]+{[^}]+}/g) || [];

    blocks.forEach((block) => {
        const [selector, body] = block.split('{');
        const rules = body.replace('}', '').trim();

        const styleObj: Record<string, string> = {};

        rules.split(';').forEach((rule) => {
            const [prop, value] = rule.split(':');
            if (!prop || !value) return;

            styleObj[prop.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase())] = value.trim();
        });

        styles[selector.trim()] = styleObj;
    });

    return styles;
}

const ALLOWED_ATTRS = AttrArrayExtension;

function elementToNode(el: HTMLElement): UINode {
    const tag = el.tagName.toLowerCase();

    if (!ALLOWED_TAGS.includes(tag)) {
        throw new Error(`Tag <${tag}> is not allowed`);
    }

    const node: UINode = {
        type: tag,
    };

    // class
    if (el.classList.length) {
        node.class = Array.from(el.classList);
    }

    // attrs
    Array.from(el.attributes).forEach((attr) => {
        if (!ALLOWED_ATTRS.includes(attr.name)) return;
        node.attrs ??= {};
        node.attrs[attr.name] = attr.value;
    });

    // children / text
    const children: UINode[] = [];

    el.childNodes.forEach((child) => {
        // Text node
        if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent?.trim();
            if (text) {
                children.push({
                    type: 'text',
                    text,
                });
            }
        }

        // Element node
        if (child.nodeType === Node.ELEMENT_NODE) {
            children.push(elementToNode(child as HTMLElement));
        }
    });

    if (children.length) {
        node.children = children;
    }

    return node;
}

export function parseHtmlToJson(html: string): UINode {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const rootEl = doc.body.firstElementChild as HTMLElement;
    if (!rootEl) {
        throw new Error('HTML must have one root element');
    }

    return elementToNode(rootEl);
}

export function convertHtmlCssToJson(html: string, css: string): UIPage {
    return {
        styles: {
            global: parseCssToJson(css),
        },
        root: parseHtmlToJson(html),
    };
}

export function generateGlobalCSS(styles: Record<string, Record<string, string>>): string {
    let css = '';

    Object.entries(styles).forEach(([selector, rules]) => {
        css += `${selector} {`;
        Object.entries(rules).forEach(([prop, value]) => {
            const cssProp = prop.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
            css += `${cssProp}: ${value};`;
        });
        css += `}\n`;
    });

    return css;
}
