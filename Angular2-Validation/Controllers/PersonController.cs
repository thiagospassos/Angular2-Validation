using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Angular2_Validation.Models;
using Microsoft.AspNetCore.Mvc;

namespace Angular2_Validation.Controllers
{
    [Route("api/[controller]")]
    public class PersonController : Controller
    {
        [HttpPost]
        public Person Post([FromBody]Person model)
        {
            return model;
        }
    }
}
