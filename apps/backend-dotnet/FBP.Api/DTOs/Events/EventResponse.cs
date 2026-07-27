using System;
using Newtonsoft.Json;

namespace FBP.Api.DTOs.Events
{
    public class EventResponse
    {
        [JsonProperty("id")]
        public Guid Id { get; set; }

        [JsonProperty("title")]
        public string Title { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("date")]
        public DateTime Date { get; set; }

        [JsonProperty("venue")]
        public string Venue { get; set; }

        [JsonProperty("totalSeats")]
        public int TotalSeats { get; set; }

        [JsonProperty("availableSeats")]
        public int AvailableSeats { get; set; }

        [JsonProperty("imageUrl")]
        public string ImageUrl { get; set; }

        [JsonProperty("type")]
        public string Type { get; set; }

        [JsonProperty("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonProperty("updatedAt")]
        public DateTime UpdatedAt { get; set; }
    }
}
