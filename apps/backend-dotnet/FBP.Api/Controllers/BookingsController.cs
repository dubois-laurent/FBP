using System.Threading.Tasks;
using System.Web.Http;
using FBP.Api.DTOs.Bookings;
using FBP.Api.Filters;
using FBP.Api.Services;
using FBP.Api.Validators;

namespace FBP.Api.Controllers
{
    [RoutePrefix("bookings")]
    [JwtAuthorize]
    public class BookingsController : BaseApiController
    {
        private readonly IBookingsService _bookingsService;

        public BookingsController(IBookingsService bookingsService)
        {
            _bookingsService = bookingsService;
        }

        // POST /bookings
        [HttpPost, Route("")]
        public async Task<IHttpActionResult> Create([FromBody] CreateBookingRequest request)
        {
            if (request == null)
                return ValidationFail("Request body is required");

            var validation = new CreateBookingValidator().Validate(request);
            if (!validation.IsValid)
                return ValidationFail(validation.Errors[0].ErrorMessage);

            var booking = await _bookingsService.CreateAsync(CurrentUserId, request);
            return Created(booking, "Booking confirmed");
        }

        // GET /bookings/my
        [HttpGet, Route("my")]
        public async Task<IHttpActionResult> GetMine()
        {
            var bookings = await _bookingsService.GetByUserAsync(CurrentUserId);
            return Success(bookings);
        }

        // DELETE /bookings/{id}
        [HttpDelete, Route("{id}")]
        public async Task<IHttpActionResult> Cancel(string id)
        {
            var booking = await _bookingsService.CancelAsync(id, CurrentUserId);
            return Success(booking, "Booking cancelled");
        }
    }
}
