using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using FBP.Api.Data.Repositories;
using FBP.Api.DTOs.Bookings;
using FBP.Api.DTOs.Events;
using FBP.Api.Lib;
using FBP.Api.Models;

namespace FBP.Api.Services
{
    public class BookingsService : IBookingsService
    {
        private readonly IBookingRepository _bookingRepo;

        public BookingsService(IBookingRepository bookingRepo)
        {
            _bookingRepo = bookingRepo;
        }

        public async Task<BookingResponse> CreateAsync(Guid userId, CreateBookingRequest request)
        {
            Guid eventId;
            if (!Guid.TryParse(request.EventId, out eventId))
                throw new AppException("Invalid event ID", HttpStatusCode.BadRequest);

            var booking = await _bookingRepo.CreateAsync(userId, eventId);
            return MapToResponse(booking);
        }

        public async Task<IEnumerable<BookingResponse>> GetByUserAsync(Guid userId)
        {
            var bookings = await _bookingRepo.GetByUserAsync(userId);
            return bookings.Select(MapToResponse);
        }

        public async Task<BookingResponse> CancelAsync(string bookingId, Guid userId)
        {
            Guid id;
            if (!Guid.TryParse(bookingId, out id))
                throw new AppException("Invalid booking ID", HttpStatusCode.BadRequest);

            var booking = await _bookingRepo.CancelAsync(id, userId);
            return MapToResponse(booking);
        }

        private static BookingResponse MapToResponse(Booking b)
        {
            var response = new BookingResponse
            {
                Id = b.Id, UserId = b.UserId, EventId = b.EventId,
                Status = b.Status, BookedAt = b.BookedAt
            };

            if (b.Event != null)
            {
                response.Event = new EventResponse
                {
                    Id = b.Event.Id, Title = b.Event.Title, Description = b.Event.Description,
                    Date = b.Event.Date, Venue = b.Event.Venue, TotalSeats = b.Event.TotalSeats,
                    AvailableSeats = b.Event.AvailableSeats, ImageUrl = b.Event.ImageUrl,
                    Type = b.Event.Type, CreatedAt = b.Event.CreatedAt, UpdatedAt = b.Event.UpdatedAt
                };
            }

            return response;
        }
    }
}
