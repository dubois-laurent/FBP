using System;

namespace FBP.Api.Models
{
    public class Message
    {
        public Guid Id { get; set; }
        public Guid SenderId { get; set; }
        public Guid ReceiverId { get; set; }
        public string Content { get; set; }
        public DateTime SentAt { get; set; }
        // Joined fields
        public string SenderName { get; set; }
        public string ReceiverName { get; set; }
    }
}
