using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Web.Http;
using System.Web.Http.Controllers;
using FBP.Api.DTOs.Common;

namespace FBP.Api.Filters
{
    /// <summary>
    /// Requires an authenticated user with a valid JWT.
    /// Sets request.Properties["CurrentUserId"] and ["CurrentUserRole"].
    /// </summary>
    public class JwtAuthorizeAttribute : AuthorizeAttribute
    {
        protected override void HandleUnauthorizedRequest(HttpActionContext actionContext)
        {
            actionContext.Response = actionContext.Request.CreateResponse(
                HttpStatusCode.Unauthorized,
                ApiResponse<object>.Fail("Authentication required"));
        }

        public override void OnAuthorization(HttpActionContext actionContext)
        {
            base.OnAuthorization(actionContext);
        }
    }

    /// <summary>
    /// Requires the authenticated user to have the "admin" role.
    /// </summary>
    public class AdminOnlyAttribute : AuthorizeAttribute
    {
        public AdminOnlyAttribute()
        {
            Roles = "admin";
        }

        protected override void HandleUnauthorizedRequest(HttpActionContext actionContext)
        {
            var code = actionContext.RequestContext.Principal?.Identity?.IsAuthenticated == true
                ? HttpStatusCode.Forbidden
                : HttpStatusCode.Unauthorized;

            actionContext.Response = actionContext.Request.CreateResponse(
                code,
                ApiResponse<object>.Fail(code == HttpStatusCode.Forbidden
                    ? "Admin access required"
                    : "Authentication required"));
        }
    }
}
