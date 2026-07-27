using System.Web.Http;
using FBP.Api.DTOs.Common;

namespace FBP.Api.Controllers
{
    public class HealthController : ApiController
    {
        [HttpGet, Route("health")]
        [AllowAnonymous]
        public IHttpActionResult Get()
        {
            return Content(System.Net.HttpStatusCode.OK, ApiResponse<object>.Ok(
                new { status = "ok", timestamp = System.DateTime.UtcNow },
                "Server is running"));
        }
    }
}
