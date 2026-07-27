using System;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using FBP.Api.DTOs.Common;
using FBP.Api.DTOs.Messages;
using FBP.Api.Filters;
using FBP.Api.Services;
using FBP.Api.Validators;

namespace FBP.Api.Controllers
{
    [RoutePrefix("messages")]
    [JwtAuthorize]
    public class MessagesController : BaseApiController
    {
        private readonly IMessagesService _messagesService;

        public MessagesController(IMessagesService messagesService)
        {
            _messagesService = messagesService;
        }

        // GET /messages/{userId}?page=1&limit=50
        [HttpGet, Route("{userId}")]
        public async Task<IHttpActionResult> GetConversation(string userId, int page = 1, int limit = 50)
        {
            Guid otherId;
            if (!Guid.TryParse(userId, out otherId))
                return ValidationFail("Invalid user ID");

            if (page < 1) page = 1;
            if (limit < 1 || limit > 100) limit = 50;

            var (messages, total) = await _messagesService.GetConversationAsync(CurrentUserId, otherId, page, limit);
            return Content(HttpStatusCode.OK, PaginatedResponse<MessageResponse>.Ok(messages, total, page, limit));
        }
    }
}
