import { Component } from '@angular/core';
import { Person } from './../../models/app.models';
import { AppService } from './../../app.service';

@Component({
    selector: 'home',
    template: require('./home.component.html')
})
export class HomeComponent {
    model: Person;

    constructor(
        private appService: AppService
    ) {
        this.model = <Person>{};
    }

    update() {
        this.appService.postPerson(this.model).subscribe(result => {
            this.model = result;
        });
    }
}
