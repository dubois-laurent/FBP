using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FBP.Api.DTOs.Bookings;

namespace FBP.Api.Services
{
    public interface IBookingsService
    {
        Task<BookingResponse> CreateAsync(Guid userId, CreateBookingRequest request);
        Task<IEnumerable<BookingResponse>> GetByUserAsync(Guid userId);
        Task<BookingResponse> CancelAsync(string bookingId, Guid userId);
    }
}
