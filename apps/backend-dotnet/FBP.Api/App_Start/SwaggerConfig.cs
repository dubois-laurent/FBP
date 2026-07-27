using System.Web.Http;
using Swashbuckle.Application;

namespace FBP.Api.App_Start
{
    public static class SwaggerConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.EnableSwagger(c =>
            {
                c.SingleApiVersion("v1", "FBP API")
                 .Description("Festival Booking Platform API — .NET Framework 4.5");

                c.ApiKey("Authorization")
                 .Description("JWT Bearer token")
                 .Name("Authorization")
                 .In("header");

                c.OperationFilter<AssignSecurityRequirements>();
                c.IncludeXmlComments(GetXmlCommentsPath());
            })
            .EnableSwaggerUi(ui =>
            {
                ui.DocumentTitle("FBP API Docs");
                ui.EnableApiKeySupport("Authorization", "header");
            });
        }

        private static string GetXmlCommentsPath()
        {
            return System.AppDomain.CurrentDomain.BaseDirectory + @"\bin\FBP.Api.xml";
        }
    }

    /// <summary>
    /// Adds the security requirement to operations that have [JwtAuthorize] or [AdminOnly].
    /// </summary>
    internal class AssignSecurityRequirements : Swashbuckle.Swagger.IOperationFilter
    {
        public void Apply(Swashbuckle.Swagger.Operation operation, Swashbuckle.Swagger.SchemaRegistry schemaRegistry,
            System.Web.Http.Description.ApiDescription apiDescription)
        {
            var hasAuth = System.Linq.Enumerable.Any(
                apiDescription.ActionDescriptor.GetCustomAttributes<System.Web.Http.AuthorizeAttribute>());

            if (!hasAuth) return;

            if (operation.security == null)
                operation.security = new System.Collections.Generic.List<System.Collections.Generic.IDictionary<string, System.Collections.Generic.IEnumerable<string>>>();

            var auth = new System.Collections.Generic.Dictionary<string, System.Collections.Generic.IEnumerable<string>>
            {
                { "Authorization", new string[] { } }
            };
            operation.security.Add(auth);
        }
    }
}
