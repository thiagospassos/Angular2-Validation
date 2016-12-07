import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Person } from './models/app.models';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/throw';
import { ValidationService } from './validation.service';

@Injectable()
export class AppService {

    constructor(
        private http: Http,
        private validationService: ValidationService
    ) { }

    postPerson(model: Person): Observable<Person> {
        return this.http.post('/api/person', model)
            .map((response: Response) => response.json())
            .catch(e => this.validationService.handleError(e));

    }
}