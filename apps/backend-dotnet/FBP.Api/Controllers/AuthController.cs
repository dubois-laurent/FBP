using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using FBP.Api.DTOs.Auth;
using FBP.Api.DTOs.Common;
using FBP.Api.Filters;
using FBP.Api.Services;
using FBP.Api.Validators;
using WebApiThrottle;

namespace FBP.Api.Controllers
{
    [RoutePrefix("auth")]
    public class AuthController : BaseApiController
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost, Route("register")]
        [EnableThrottling(PerMinute = 10)]
        public async Task<IHttpActionResult> Register([FromBody] RegisterRequest request)
        {
            if (request == null)
                return ValidationFail("Request body is required");

            var validation = new RegisterValidator().Validate(request);
            if (!validation.IsValid)
                return ValidationFail(validation.Errors[0].ErrorMessage);

            var result = await _authService.RegisterAsync(request);
            return Created(result, "Registration successful");
        }

        [HttpPost, Route("login")]
        [EnableThrottling(PerMinute = 10)]
        public async Task<IHttpActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null)
                return ValidationFail("Request body is required");

            var validation = new LoginValidator().Validate(request);
            if (!validation.IsValid)
                return ValidationFail(validation.Errors[0].ErrorMessage);

            var result = await _authService.LoginAsync(request);
            return Success(result, "Login successful");
        }

        [HttpPost, Route("refresh")]
        public async Task<IHttpActionResult> Refresh([FromBody] RefreshRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.RefreshToken))
                return ValidationFail("refreshToken is required");

            var result = await _authService.RefreshAsync(request.RefreshToken);
            return Success(result);
        }

        [HttpPost, Route("logout")]
        [JwtAuthorize]
        public IHttpActionResult Logout()
        {
            // Stateless JWT — no server-side session to invalidate
            return Success<object>(null, "Logged out successfully");
        }
    }
}
