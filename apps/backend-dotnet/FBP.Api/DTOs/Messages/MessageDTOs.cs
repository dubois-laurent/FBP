using System;
using Newtonsoft.Json;

namespace FBP.Api.DTOs.Messages
{
    public class SendMessageRequest
    {
        [JsonProperty("receiverId")]
        public string ReceiverId { get; set; }

        [JsonProperty("content")]
        public string Content { get; set; }
    }

    public class MessageResponse
    {
        [JsonProperty("id")]
        public Guid Id { get; set; }

        [JsonProperty("senderId")]
        public Guid SenderId { get; set; }

        [JsonProperty("receiverId")]
        public Guid ReceiverId { get; set; }

        [JsonProperty("content")]
        public string Content { get; set; }

        [JsonProperty("sentAt")]
        public DateTime SentAt { get; set; }

        [JsonProperty("senderName")]
        public string SenderName { get; set; }

        [JsonProperty("receiverName")]
        public string ReceiverName { get; set; }
    }
}
