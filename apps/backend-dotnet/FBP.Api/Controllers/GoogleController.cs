using System;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using FBP.Api.Config;
using FBP.Api.Services;

namespace FBP.Api.Controllers
{
    [RoutePrefix("auth")]
    public class GoogleController : ApiController
    {
        private readonly IAuthService _authService;

        public GoogleController(IAuthService authService)
        {
            _authService = authService;
        }

        // GET /auth/google — initiates the Google OAuth flow
        [HttpGet, Route("google")]
        public HttpResponseMessage InitiateLogin()
        {
            Request.GetOwinContext().Authentication.Challenge(
                new Microsoft.Owin.Security.AuthenticationProperties
                {
                    RedirectUri = "/auth/google/finalize"
                },
                "Google");

            return new HttpResponseMessage(HttpStatusCode.Unauthorized);
        }

        // GET /auth/google/finalize — called by OWIN after successful Google callback
        [HttpGet, Route("google/finalize")]
        public async Task<HttpResponseMessage> FinalizeLogin()
        {
            var owinCtx = Request.GetOwinContext();
            var result = await owinCtx.Authentication.AuthenticateAsync("ExternalCookie");

            if (result == null)
            {
                var failUri = new Uri(AppSettings.FrontendUrl + "/login?error=google_auth_failed");
                var failResponse = new HttpResponseMessage(HttpStatusCode.Found);
                failResponse.Headers.Location = failUri;
                return failResponse;
            }

            var googleId = result.Identity.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = result.Identity.FindFirst(ClaimTypes.Email)?.Value;
            var name = result.Identity.FindFirst(ClaimTypes.Name)?.Value;

            // Sign out the external cookie now that we have the claims
            owinCtx.Authentication.SignOut("ExternalCookie");

            if (string.IsNullOrEmpty(googleId) || string.IsNullOrEmpty(email))
            {
                var failUri = new Uri(AppSettings.FrontendUrl + "/login?error=google_missing_data");
                var failResponse = new HttpResponseMessage(HttpStatusCode.Found);
                failResponse.Headers.Location = failUri;
                return failResponse;
            }

            var authResult = await _authService.HandleGoogleLoginAsync(googleId, email, name ?? email);

            var redirectUrl = string.Format(
                "{0}/auth/google/callback?token={1}&refreshToken={2}",
                AppSettings.FrontendUrl,
                Uri.EscapeDataString(authResult.AccessToken),
                Uri.EscapeDataString(authResult.RefreshToken));

            var response = new HttpResponseMessage(HttpStatusCode.Found);
            response.Headers.Location = new Uri(redirectUrl);
            return response;
        }
    }
}
