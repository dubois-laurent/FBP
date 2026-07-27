using System;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Web.Http;
using FBP.Api.DTOs.Common;
using FBP.Api.Lib;

namespace FBP.Api.Controllers
{
    public abstract class BaseApiController : ApiController
    {
        protected Guid CurrentUserId
        {
            get
            {
                var sub = (User?.Identity as ClaimsIdentity)?.FindFirst("sub")?.Value;
                Guid id;
                if (string.IsNullOrEmpty(sub) || !Guid.TryParse(sub, out id))
                    throw new AppException("Unauthorized", HttpStatusCode.Unauthorized);
                return id;
            }
        }

        protected string CurrentUserRole
        {
            get
            {
                return (User?.Identity as ClaimsIdentity)?.FindFirst("role")?.Value;
            }
        }

        protected IHttpActionResult Success<T>(T data, string message = null)
        {
            return Content(HttpStatusCode.OK, ApiResponse<T>.Ok(data, message));
        }

        protected IHttpActionResult Created<T>(T data, string message = null)
        {
            return Content(HttpStatusCode.Created, ApiResponse<T>.Ok(data, message));
        }

        protected IHttpActionResult Fail(string message, HttpStatusCode code = HttpStatusCode.BadRequest)
        {
            return Content(code, ApiResponse<object>.Fail(message));
        }

        protected IHttpActionResult ValidationFail(string message)
        {
            return Content(HttpStatusCode.BadRequest, ApiResponse<object>.Fail(message));
        }
    }
}
