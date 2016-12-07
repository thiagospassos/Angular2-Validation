import { ElementRef, Directive, Renderer } from '@angular/core';
import { ValidationService } from './../validation.service';

@Directive({
    selector: '[handleValidation]'
})
export class HandleValidationDirective {
    constructor(private el: ElementRef, private renderer: Renderer, private validationService: ValidationService) {
        this.validationService.validationChanged.subscribe(() => this.handleErrors());
        renderer.listen(el.nativeElement, 'change', event => this.handleClienValidation(event));
    }

    handleErrors() {
        let name = this.el.nativeElement.name;
        let handler = this.validationService.getErrors(location.pathname);

        if (name) {
            let parent = this.el.nativeElement.parentNode;
            this.removeChildBlocks(parent);

            if (handler && handler.errors) {
                let error = handler.errors[`${name}`];
                if (error) {
                    this.renderer.setElementClass(parent, 'has-error', true);
                    let block = this.renderer.createElement(parent, 'span');
                    this.renderer.setElementClass(block, 'help-block', true);
                    this.renderer.setText(block, error);
                }
            }
        } else {
            this.removeChildBlocks(this.el.nativeElement);
            let block = this.renderer.createElement(this.el.nativeElement, 'span');
            this.renderer.setElementClass(block, 'help-block', true);
            this.renderer.setText(block, handler.error);
        }
    }

    handleClienValidation(event: any) {
        let el = event.target;
        let name = this.el.nativeElement.name;
        let error = '';
        this.clearError(el.parentNode);
        if (!el.validity.valid) {
            if (el.validity.valueMissing) { error = `The ${name} field is required (client)`; }
            if (el.validity.rangeUnderflow) { error = `Value is under minimum of ${this.el.nativeElement.min}`; }
            if (el.validity.rangeOverflow) { error = `Value is over maximum of ${this.el.nativeElement.max}`; }
            if (el.validity.patternMismatch) { error = `Wrong Format (${this.el.nativeElement.pattern})`; }

            this.renderer.setElementClass(el.parentNode, 'has-error', true);
            if (error) {
                this.addErrorBlock(el, error);
            }
        }
    }

    addErrorBlock(el: any, error: string) {
        let block = this.renderer.createElement(el.parentNode, 'span');
        this.renderer.setElementClass(block, 'help-block', true);
        this.renderer.setText(block, error);
    }

    clearError(el: any) {
        this.renderer.setElementClass(el, 'has-error', false);
        this.removeChildBlocks(el);
    }

    private removeChildBlocks(el: any) {
        try {
            // IE does NOT support forEach from childNodes
            var array = Array.from(el.childNodes);
            array.forEach((element: any) => {
                if (element) {
                    if (element.className == 'help-block') {
                        el.removeChild(element);
                    }
                }
            });
        } catch (e) {
            console.log(e);
        }
    }
}
