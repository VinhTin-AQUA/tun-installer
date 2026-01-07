export enum EventBinding {
    click = 'event-click',
}

export enum AttrBinding {
    href = 'prop-href',
    src = 'prop-src',
}

export enum Attrs {
    alt = 'alt',
    class = 'class',
    href = 'href',
    src = 'src',
}

export const AttrArrayExtension: string[] = [
    ...Object.values(EventBinding),
    ...Object.values(AttrBinding),
    ...Object.values(Attrs),
];

export const ALLOWED_TAGS = [
    'header',
    'a',
    'b',
    'body',
    'br',
    'button',
    'div',
    'footer',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'head',
    'header',
    'hr',
    'i',
    'img',
    'input',
    'label',
    'li',
    'main',
    'nav',
    'ol',
    'p',
    'section',
    'small',
    'span',
    'strong',
    'svg',
    'table',
    'tbody',
    'td',
    'textarea',
    'th',
    'thead',
    'tr',
    'u',
    'ul',
];
