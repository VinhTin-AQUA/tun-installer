import { Directive, ElementRef, Input } from '@angular/core';

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
            if (key === '(click)') {
                element.addEventListener('click', () => {
                    const fn = this.context?.[value];
                    if (typeof fn === 'function') {
                        fn.call(this.context);
                    }
                });
            }
            // ATTRIBUTE
            else {
                element.setAttribute(key, value);
            }
        });
    }
}
