using System;
using System.Text;
using System.Threading.Tasks;
using System.Web.Cors;
using Microsoft.Owin;
using Microsoft.Owin.Cors;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.Google;
using Microsoft.Owin.Security.Jwt;
using Owin;
using System.IdentityModel.Tokens;
using System.Web.Http;
using FBP.Api.App_Start;
using FBP.Api.Config;
using Microsoft.AspNet.SignalR;
using FBP.Api.Hubs;
using Autofac;
using Microsoft.AspNet.SignalR;
[assembly: OwinStartup(typeof(FBP.Api.Startup))]

namespace FBP.Api
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // 1. CORS
            var corsPolicy = new CorsPolicy
            {
                AllowAnyHeader = true,
                AllowAnyMethod = true,
                SupportsCredentials = true
            };
            corsPolicy.Origins.Add(AppSettings.FrontendUrl);

            app.UseCors(new CorsOptions
            {
                PolicyProvider = new CorsPolicyProvider
                {
                    PolicyResolver = _ => Task.FromResult(corsPolicy)
                }
            });

            // 2. External cookie for Google OAuth intermediate step
            app.UseCookieAuthentication(new CookieAuthenticationOptions
            {
                AuthenticationType = "ExternalCookie",
                AuthenticationMode = AuthenticationMode.Passive,
                CookieName = ".AspNet.ExternalCookie",
                ExpireTimeSpan = TimeSpan.FromMinutes(5)
            });

            // 3. Google OAuth2
            if (!string.IsNullOrEmpty(AppSettings.GoogleClientId))
            {
                app.UseGoogleAuthentication(new GoogleOAuth2AuthenticationOptions
                {
                    ClientId = AppSettings.GoogleClientId,
                    ClientSecret = AppSettings.GoogleClientSecret,
                    CallbackPath = new PathString("/auth/google/callback"),
                    SignInAsAuthenticationType = "ExternalCookie"
                });
            }

            // 4. JWT Bearer authentication
            var signingKey = new InMemorySymmetricSecurityKey(
                Encoding.UTF8.GetBytes(AppSettings.JwtAccessSecret));

            app.UseJwtBearerAuthentication(new JwtBearerAuthenticationOptions
            {
                AuthenticationMode = AuthenticationMode.Active,
                TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    IssuerSigningKey = signingKey
                }
            });

            // 5. Web API (also builds the Autofac container and stores it in DependencyConfig)
            var config = new HttpConfiguration();
            WebApiConfig.Register(config);
            app.UseWebApi(config);

            // 6. SignalR — register Hub factory via service locator (no Autofac.Integration.SignalR)
            GlobalHost.DependencyResolver.Register(
                typeof(FBP.Api.Hubs.ChatHub),
                () => new FBP.Api.Hubs.ChatHub(
                    DependencyConfig.Container.Resolve<FBP.Api.Services.IMessagesService>()));
            GlobalHost.DependencyResolver.Register(
                typeof(Microsoft.AspNet.SignalR.IUserIdProvider),
                () => new FBP.Api.Hubs.ChatUserIdProvider());

            var hubConfig = new HubConfiguration { EnableDetailedErrors = false };

            app.Map("/hub", map =>
            {
                map.UseCors(CorsOptions.AllowAll);
                map.RunSignalR(hubConfig);
            });
        }
    }
}
