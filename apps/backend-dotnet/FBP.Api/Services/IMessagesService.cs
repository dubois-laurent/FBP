using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FBP.Api.DTOs.Messages;

namespace FBP.Api.Services
{
    public interface IMessagesService
    {
        Task<(IEnumerable<MessageResponse> Messages, int Total)> GetConversationAsync(
            Guid currentUserId, Guid otherUserId, int page, int limit);
        Task<MessageResponse> CreateMessageAsync(Guid senderId, Guid receiverId, string content);
    }
}
