using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Angular2_Validation.Models
{
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
}
