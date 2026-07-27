using System.Net;
using System.Net.Http;
using System.Web.Http.Filters;
using FBP.Api.DTOs.Common;
using FBP.Api.Lib;

namespace FBP.Api.Filters
{
    public class GlobalExceptionFilter : ExceptionFilterAttribute
    {
        public override void OnException(HttpActionExecutedContext context)
        {
            if (context.Exception is AppException appEx)
            {
                context.Response = context.Request.CreateResponse(
                    appEx.StatusCode,
                    ApiResponse<object>.Fail(appEx.Message));
            }
            else
            {
                context.Response = context.Request.CreateResponse(
                    HttpStatusCode.InternalServerError,
                    ApiResponse<object>.Fail("An unexpected error occurred"));
            }
        }
    }

    public class ValidateModelAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            if (!actionContext.ModelState.IsValid)
            {
                actionContext.Response = actionContext.Request.CreateResponse(
                    HttpStatusCode.BadRequest,
                    ApiResponse<object>.Fail("Request body is missing or malformed"));
            }
        }
    }
}
