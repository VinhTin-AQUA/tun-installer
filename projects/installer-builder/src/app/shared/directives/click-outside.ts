import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
    selector: '[appClickOutside]',
})
export class ClickOutside {
    @Output() appClickOutside = new EventEmitter<void>();

    constructor(private elementRef: ElementRef) {}

    @HostListener('document:click', ['$event.target'])
    public onClick(targetElement: EventTarget | null) {
        if (!(targetElement instanceof HTMLElement)) return;

        const clickedInside = this.elementRef.nativeElement.contains(targetElement);
        if (!clickedInside) {
            this.appClickOutside.emit();
        }
    }
}
