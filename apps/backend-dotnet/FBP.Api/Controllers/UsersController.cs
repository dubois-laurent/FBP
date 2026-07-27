using System.Threading.Tasks;
using System.Web.Http;
using FBP.Api.DTOs.Users;
using FBP.Api.Filters;
using FBP.Api.Services;
using FBP.Api.Validators;

namespace FBP.Api.Controllers
{
    [RoutePrefix("users")]
    [JwtAuthorize]
    public class UsersController : BaseApiController
    {
        private readonly IUsersService _usersService;

        public UsersController(IUsersService usersService)
        {
            _usersService = usersService;
        }

        // GET /users/profile
        [HttpGet, Route("profile")]
        public async Task<IHttpActionResult> GetProfile()
        {
            var user = await _usersService.GetProfileAsync(CurrentUserId);
            return Success(user);
        }

        // PUT /users/profile
        [HttpPut, Route("profile")]
        public async Task<IHttpActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            if (request == null)
                return ValidationFail("Request body is required");

            var validation = new UpdateProfileValidator().Validate(request);
            if (!validation.IsValid)
                return ValidationFail(validation.Errors[0].ErrorMessage);

            var user = await _usersService.UpdateProfileAsync(CurrentUserId, request);
            return Success(user, "Profile updated");
        }
    }
}
