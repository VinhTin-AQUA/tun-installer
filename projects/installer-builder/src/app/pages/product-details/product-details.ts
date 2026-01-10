import { Component } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-product-details',
    imports: [ReactiveFormsModule],
    templateUrl: './product-details.html',
    styleUrl: './product-details.css',
})
export class ProductDetails {
    form: FormGroup;

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            appDir: [''],
            productName: [''],
            icon: [''],
            productVersion: [''],
            publisher: [''],
            supportLink: [''],
            supportEmail: [''],
            comment: [''],
            buildDir: [''],
            fileToRun: [''],
            runAsAdmin: [false],
            lauchApp: [false],
        });
    }

    submit() {
        console.log(this.form.value);
    }
}
