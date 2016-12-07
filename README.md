# Angular2 + .net Core: Seamless Client & Server Validation

Most of the projects I work on nowadays are based on forms over data, and something that is always going to happen is some kind of data validation either before getting into the server or in the server itself. And most of the time I want this validation to happen on both sides. The good old .net MVC does that for us beautifully with Unobtrusive Validation, but what about Angular? I haven't found so far a good story that covers this scenario. So I had build it.

So here's what I did:

* Implemented a [global filter](#globalFilter) in .net to check if the model is valid, if it's not valid it'll return an error back to the client with broken rules based on [data annotation](#dataAnnotation) against the model. The global filter itself is not required, you could live with adding the attribute to specific methods and/or controllers.
* Created a [validation service](#validationService) in Angular to handle all errors coming from the server;
* Created a [directive](#directive) to handle both client and server side validation errors

> The source code covered in this post is available [here](https://github.com/thiagospassos/Angular2-Validation)
>
> Also as a base line, I'm using [Steven Anderson's Angular2 + .net Core Visual Studio template](http://blog.stevensanderson.com/2016/10/04/angular2-template-for-visual-studio/)

### <a id="globalFilter"></a>Global Filter

First let's start creating the filter. This filter will be responsible for returning a bad request back to the client with the model state if the same is not valid. It will also return a bad request with a general error message if an exception happens but it's not related to the model state.
```
public class ValidateModelAttribute : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext actionContext)
    {
        if (!actionContext.ModelState.IsValid)
        {
            actionContext.Result = new BadRequestObjectResult(actionContext.ModelState);
        }
    }

    public override void OnActionExecuted(ActionExecutedContext actionExecutedContext)
    {
        if (actionExecutedContext.Exception != null)
        {
            actionExecutedContext.Result = new BadRequestObjectResult(actionExecutedContext.Exception.Message);
        }
        base.OnActionExecuted(actionExecutedContext);
    }
}
```

Once we have the filter, we configure it globally in the `Startup.cs` file. Again, you can get away without this configuration, you can add the attribute to specific methods and/or controllers if you think it's best. But in my opinion I much rather configuring this once and let it handle for me.
```
public void ConfigureServices(IServiceCollection services)
{
    var builder = services.AddMvc();
    builder.AddMvcOptions(o => { o.Filters.Add(new ValidateModelAttribute()); });
}
```
### <a id="dataAnnotation"></a>Create Validation Rules

For now I've created a simple person model with a couple of required fields using Data Annotation. You can also use fluent validation if you like. Some tweaks might be required though. Check out the [System.ComponentModel.DataAnnotations Namespace](https://msdn.microsoft.com/en-us/library/system.componentmodel.dataannotations(v=vs.110).aspx) for other available annotations.
```
public class Person
{
    [Required]
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Nickname { get; set; }
    [Required]
    [EmailAddress]
    public string Email { get; set; }
}
```
My controller also looks pretty simple and really doesn't do anything in the server side apart from validating the model:
```
[Route("api/[controller]")]
public class PersonController : Controller
{
    [HttpPost]
    public Person Post([FromBody]Person model)
    {
        return model;
    }
}
```

### <a id="validationService"></a>Validation Service

The validation service will get the errors coming from the server and store them in an array of `RouteErrors` which also stores the route path and general error in case the error is thrown by something else than the model state.
```
export interface RouteErrors {
    route: string;
    error: string;
    errors: any;
}
```

These are the main methods of the validation service. One of them will be the entry point for the validation handler and the other will be used to store the errors:
```
handleError(error: any) {
    this.setModelStateErrors(error);
    let errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    return Observable.throw(errMsg);
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
```

And the way I'm gonna use the validation service in the api calls will be like this. In case something goes wrong during the api call it is handled by the validationService.
```
postPerson(model: Person): Observable<Person> {
    return this.http.post('/api/person', model)
        .map((response: Response) => response.json())
        .catch(e => this.validationService.handleError(e));

}
```

### <a id="directive"></a>Directive

And the last piece of the puzzle is the directive. Which will check for any available errors in the validation service for that route with the specific field name. I'm not putting a sample of the code here as it'd take to much room, but have a look at the [source code](https://github.com/thiagospassos/Angular2-Validation)

Here's an example on how it's implemented:
`<input type="text" [(ngModel)]="model.lasName" handleValidation required name="LastName">`

#### Conclusion

I know it does look like a lot of code to write just for a simple validation, but most of it is just a one off thing. Once everything is in place it's so much easier to add validation to other forms.