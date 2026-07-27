using System;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using FBP.Api.DTOs.Messages;
using FBP.Api.Services;
using System.IdentityModel.Tokens;
using System.Linq;

namespace FBP.Api.Hubs
{
    /// <summary>
    /// Real-time messaging hub. Replaces Socket.io.
    /// Clients connect with ?token=<jwt> in the URL.
    /// Frontend: migrate from socket.io-client to @microsoft/signalr.
    /// </summary>
    public class ChatHub : Hub
    {
        private readonly IMessagesService _messagesService;

        public ChatHub(IMessagesService messagesService)
        {
            _messagesService = messagesService;
        }

        public override Task OnConnected()
        {
            var userId = Context.User?.Identity?.Name;
            if (!string.IsNullOrEmpty(userId))
                Groups.Add(Context.ConnectionId, userId);

            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            var userId = Context.User?.Identity?.Name;
            if (!string.IsNullOrEmpty(userId))
                Groups.Remove(Context.ConnectionId, userId);

            return base.OnDisconnected(stopCalled);
        }

        /// <summary>
        /// Client invokes this method to send a message.
        /// </summary>
        public async Task SendMessage(string receiverId, string content)
        {
            var senderId = GetCurrentUserId();
            if (string.IsNullOrEmpty(senderId))
                throw new HubException("Unauthorized: valid token required");

            content = content?.Trim() ?? string.Empty;
            if (string.IsNullOrEmpty(content) || content.Length > 2000)
                throw new HubException("Content must be between 1 and 2000 characters");

            Guid receiverGuid;
            if (!Guid.TryParse(receiverId, out receiverGuid))
                throw new HubException("receiverId must be a valid UUID");

            Guid senderGuid;
            if (!Guid.TryParse(senderId, out senderGuid))
                throw new HubException("Invalid sender ID");

            var message = await _messagesService.CreateMessageAsync(senderGuid, receiverGuid, content);

            // Push to receiver (all their connections/tabs)
            Clients.User(receiverId).receiveMessage(message);
            // Echo to sender (other open tabs)
            Clients.User(senderId).receiveMessage(message);
        }

        private string GetCurrentUserId()
        {
            // First try via IUserIdProvider (populated in Context.User.Identity.Name)
            var name = Context.User?.Identity?.Name;
            if (!string.IsNullOrEmpty(name))
                return name;

            // Fallback: re-parse token from query string
            var token = Context.QueryString["token"];
            if (string.IsNullOrEmpty(token))
                return null;

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwt = handler.ReadToken(token) as JwtSecurityToken;
                return jwt?.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
            }
            catch
            {
                return null;
            }
        }
    }
}
