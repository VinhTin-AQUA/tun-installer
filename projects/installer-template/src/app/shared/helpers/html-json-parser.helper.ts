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
