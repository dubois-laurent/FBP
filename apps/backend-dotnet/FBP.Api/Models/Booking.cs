using System;

namespace FBP.Api.Models
{
    public class Booking
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid EventId { get; set; }
        public string Status { get; set; }
        public DateTime BookedAt { get; set; }
        // Joined fields
        public Event Event { get; set; }
    }

    public static class BookingStatus
    {
        public const string Confirmed = "confirmed";
        public const string Cancelled = "cancelled";
    }
}
