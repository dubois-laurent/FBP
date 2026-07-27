using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FBP.Api.Models;

namespace FBP.Api.Data.Repositories
{
    public interface IMessageRepository
    {
        Task<(IEnumerable<Message> Messages, int Total)> GetConversationAsync(
            Guid userId1, Guid userId2, int page, int limit);
        Task<Message> CreateAsync(Guid senderId, Guid receiverId, string content);
    }
}
