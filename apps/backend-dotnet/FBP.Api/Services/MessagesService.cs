using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FBP.Api.Data.Repositories;
using FBP.Api.DTOs.Messages;
using FBP.Api.Models;

namespace FBP.Api.Services
{
    public class MessagesService : IMessagesService
    {
        private readonly IMessageRepository _messageRepo;

        public MessagesService(IMessageRepository messageRepo)
        {
            _messageRepo = messageRepo;
        }

        public async Task<(IEnumerable<MessageResponse> Messages, int Total)> GetConversationAsync(
            Guid currentUserId, Guid otherUserId, int page, int limit)
        {
            var (messages, total) = await _messageRepo.GetConversationAsync(currentUserId, otherUserId, page, limit);
            return (messages.Select(MapToResponse), total);
        }

        public async Task<MessageResponse> CreateMessageAsync(Guid senderId, Guid receiverId, string content)
        {
            var message = await _messageRepo.CreateAsync(senderId, receiverId, content);
            return MapToResponse(message);
        }

        private static MessageResponse MapToResponse(Message m)
        {
            return new MessageResponse
            {
                Id = m.Id, SenderId = m.SenderId, ReceiverId = m.ReceiverId,
                Content = m.Content, SentAt = m.SentAt,
                SenderName = m.SenderName, ReceiverName = m.ReceiverName
            };
        }
    }
}
