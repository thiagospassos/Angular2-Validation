import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

export interface RouteErrors {
    route: string;
    error: string;
    errors: any;
}

@Injectable()
export class ValidationService {
    errors: RouteErrors[];
    validationChanged: EventEmitter<boolean> = new EventEmitter();

    constructor() {
        this.errors = [];
    }

    getErrors(route: string): RouteErrors {
        let errors = this.errors.find(e => e.route == route);
        if (!errors) {
            errors = <RouteErrors>{ route: route, errors: [] };
        }
        return errors;
    }

    setErrors(handler: RouteErrors) {
        let index = this.errors.findIndex(e => e.route == handler.route);
        if (index >= 0) {
            this.errors[index] = handler;
        } else {
            this.errors.push(handler);
        }
        this.validationChanged.emit(true);
    }

    setModelStateErrors(response: any) {
        let errorJson = response.json();
        if (errorJson) {
            this.setErrors(<RouteErrors>{
                route: location.pathname,
                error: errorJson.message ? errorJson.message : errorJson.error_description,
                errors: errorJson
            });
        }
    }

    handleError(error: any) {
        this.setModelStateErrors(error);
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        return Observable.throw(errMsg);
    }
}
