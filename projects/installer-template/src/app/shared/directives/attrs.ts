import { Directive, ElementRef, Input } from '@angular/core';
import { EventBinding, AttrBinding } from 'installer-core';

@Directive({
    selector: '[appAttrs]',
})
export class Attrs {
    @Input() appAttrs?: Record<string, string>;
    @Input() context?: any; // component context

    constructor(private el: ElementRef<HTMLElement>) {}

    ngOnInit() {
        if (!this.appAttrs) return;

        const element = this.el.nativeElement;

        Object.entries(this.appAttrs).forEach(([key, value]) => {
            // EVENT
            if (key === EventBinding.click) {
                element.addEventListener('click', () => {
                    const fn = this.context?.[value];
                    if (typeof fn === 'function') {
                        fn.call(this.context);
                    }
                });
            } else if (key === AttrBinding.href) {
                const realValue = this.context?.[value];
                if (realValue != null) {
                    (element as HTMLAnchorElement).href = realValue;
                }
            } else if (key === AttrBinding.src) {
                const realValue = this.context?.[value];
                if (realValue != null) {
                    (element as HTMLImageElement).src = realValue;
                }
            }
            // ATTRIBUTE
            else {
                element.setAttribute(key, value);
            }
        });
    }
}
