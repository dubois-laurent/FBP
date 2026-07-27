using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using FBP.Api.DTOs.Common;
using FBP.Api.DTOs.Events;
using FBP.Api.Filters;
using FBP.Api.Services;
using FBP.Api.Validators;

namespace FBP.Api.Controllers
{
    [RoutePrefix("events")]
    public class EventsController : BaseApiController
    {
        private readonly IEventsService _eventsService;

        public EventsController(IEventsService eventsService)
        {
            _eventsService = eventsService;
        }

        // GET /events?page=1&limit=10&type=conference&date=2024-01-01
        [HttpGet, Route("")]
        [AllowAnonymous]
        public async Task<IHttpActionResult> GetAll(int page = 1, int limit = 10,
            string type = null, string date = null)
        {
            if (page < 1) page = 1;
            if (limit < 1 || limit > 100) limit = 10;

            var (events, total) = await _eventsService.GetAllAsync(page, limit, type, date);
            return Content(HttpStatusCode.OK, PaginatedResponse<EventResponse>.Ok(events, total, page, limit));
        }

        // GET /events/{id}
        [HttpGet, Route("{id}")]
        [AllowAnonymous]
        public async Task<IHttpActionResult> GetById(string id)
        {
            var evt = await _eventsService.GetByIdAsync(id);
            return Success(evt);
        }

        // POST /events (admin only)
        [HttpPost, Route("")]
        [AdminOnly]
        public async Task<IHttpActionResult> Create([FromBody] CreateEventRequest request)
        {
            if (request == null)
                return ValidationFail("Request body is required");

            var validation = new CreateEventValidator().Validate(request);
            if (!validation.IsValid)
                return ValidationFail(validation.Errors[0].ErrorMessage);

            var evt = await _eventsService.CreateAsync(request);
            return Created(evt, "Event created");
        }

        // PUT /events/{id} (admin only)
        [HttpPut, Route("{id}")]
        [AdminOnly]
        public async Task<IHttpActionResult> Update(string id, [FromBody] UpdateEventRequest request)
        {
            if (request == null)
                return ValidationFail("Request body is required");

            var evt = await _eventsService.UpdateAsync(id, request);
            return Success(evt, "Event updated");
        }

        // DELETE /events/{id} (admin only)
        [HttpDelete, Route("{id}")]
        [AdminOnly]
        public async Task<IHttpActionResult> Delete(string id)
        {
            await _eventsService.DeleteAsync(id);
            return Success<object>(null, "Event deleted");
        }
    }
}
