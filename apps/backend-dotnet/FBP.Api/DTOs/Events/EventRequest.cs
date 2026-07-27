using Newtonsoft.Json;

namespace FBP.Api.DTOs.Events
{
    public class CreateEventRequest
    {
        [JsonProperty("title")]
        public string Title { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("date")]
        public string Date { get; set; }

        [JsonProperty("venue")]
        public string Venue { get; set; }

        [JsonProperty("totalSeats")]
        public int TotalSeats { get; set; }

        [JsonProperty("imageUrl")]
        public string ImageUrl { get; set; }

        [JsonProperty("type")]
        public string Type { get; set; }
    }

    public class UpdateEventRequest
    {
        [JsonProperty("title")]
        public string Title { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("date")]
        public string Date { get; set; }

        [JsonProperty("venue")]
        public string Venue { get; set; }

        [JsonProperty("totalSeats")]
        public int? TotalSeats { get; set; }

        [JsonProperty("imageUrl")]
        public string ImageUrl { get; set; }

        [JsonProperty("type")]
        public string Type { get; set; }
    }
}
