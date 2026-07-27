using System;
using Newtonsoft.Json;
using FBP.Api.DTOs.Events;

namespace FBP.Api.DTOs.Bookings
{
    public class CreateBookingRequest
    {
        [JsonProperty("eventId")]
        public string EventId { get; set; }
    }

    public class BookingResponse
    {
        [JsonProperty("id")]
        public Guid Id { get; set; }

        [JsonProperty("userId")]
        public Guid UserId { get; set; }

        [JsonProperty("eventId")]
        public Guid EventId { get; set; }

        [JsonProperty("status")]
        public string Status { get; set; }

        [JsonProperty("bookedAt")]
        public DateTime BookedAt { get; set; }

        [JsonProperty("event")]
        public EventResponse Event { get; set; }
    }
}
