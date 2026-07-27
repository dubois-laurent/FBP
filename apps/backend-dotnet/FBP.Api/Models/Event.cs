using System;

namespace FBP.Api.Models
{
    public class Event
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime Date { get; set; }
        public string Venue { get; set; }
        public int TotalSeats { get; set; }
        public int AvailableSeats { get; set; }
        public string ImageUrl { get; set; }
        public string Type { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public static class EventType
    {
        public const string Exposition = "exposition";
        public const string Conference = "conference";
        public const string Atelier = "atelier";
        public const string Rencontre = "rencontre";

        public static readonly string[] All = { Exposition, Conference, Atelier, Rencontre };

        public static bool IsValid(string value)
        {
            if (string.IsNullOrEmpty(value)) return false;
            return System.Array.Exists(All, t => t == value.ToLowerInvariant());
        }
    }
}
