using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Dapper;
using FBP.Api.Lib;
using FBP.Api.Models;
using Npgsql;

namespace FBP.Api.Data.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private const string BookingFields =
            "b.id AS Id, b.user_id AS UserId, b.event_id AS EventId, " +
            "b.status::text AS Status, b.booked_at AS BookedAt";

        private const string EventFields =
            "e.id AS Id, e.title AS Title, e.description AS Description, " +
            "e.date AS Date, e.venue AS Venue, " +
            "e.total_seats AS TotalSeats, e.available_seats AS AvailableSeats, " +
            "e.image_url AS ImageUrl, e.type::text AS Type, " +
            "e.created_at AS CreatedAt, e.updated_at AS UpdatedAt";

        private readonly IDbConnectionFactory _factory;

        public BookingRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }

        public async Task<Booking> CreateAsync(Guid userId, Guid eventId)
        {
            using (var conn = (NpgsqlConnection)_factory.Create())
            {
                await conn.OpenAsync();
                using (var tx = conn.BeginTransaction())
                {
                    // Lock the event row and check seats
                    var availableSeats = await conn.QueryFirstOrDefaultAsync<int>(
                        "SELECT available_seats FROM events WHERE id = @EventId FOR UPDATE",
                        new { EventId = eventId }, tx);

                    if (availableSeats <= 0)
                        throw new AppException("No seats available for this event", HttpStatusCode.Conflict);

                    // Check duplicate booking
                    var existing = await conn.QueryFirstOrDefaultAsync<int>(
                        "SELECT COUNT(*) FROM bookings WHERE user_id = @UserId AND event_id = @EventId AND status = 'confirmed'",
                        new { UserId = userId, EventId = eventId }, tx);

                    if (existing > 0)
                        throw new AppException("You have already booked this event", HttpStatusCode.Conflict);

                    var bookingId = Guid.NewGuid();

                    await conn.ExecuteAsync(
                        "INSERT INTO bookings (id, user_id, event_id, status, booked_at) " +
                        "VALUES (@Id, @UserId, @EventId, 'confirmed', now())",
                        new { Id = bookingId, UserId = userId, EventId = eventId }, tx);

                    await conn.ExecuteAsync(
                        "UPDATE events SET available_seats = available_seats - 1, updated_at = now() WHERE id = @EventId",
                        new { EventId = eventId }, tx);

                    tx.Commit();

                    return await GetByIdAsync(bookingId);
                }
            }
        }

        public async Task<IEnumerable<Booking>> GetByUserAsync(Guid userId)
        {
            using (var conn = _factory.Create())
            {
                conn.Open();
                var results = await conn.QueryAsync<Booking, Event, Booking>(
                    $"SELECT {BookingFields}, {EventFields} " +
                    "FROM bookings b " +
                    "JOIN events e ON b.event_id = e.id " +
                    "WHERE b.user_id = @UserId " +
                    "ORDER BY b.booked_at DESC",
                    (booking, evt) => { booking.Event = evt; return booking; },
                    new { UserId = userId },
                    splitOn: "Id");

                return results;
            }
        }

        public async Task<Booking> GetByIdAsync(Guid id)
        {
            using (var conn = _factory.Create())
            {
                conn.Open();
                var results = await conn.QueryAsync<Booking, Event, Booking>(
                    $"SELECT {BookingFields}, {EventFields} " +
                    "FROM bookings b " +
                    "JOIN events e ON b.event_id = e.id " +
                    "WHERE b.id = @Id",
                    (booking, evt) => { booking.Event = evt; return booking; },
                    new { Id = id },
                    splitOn: "Id");

                return results.AsList().Count > 0 ? results.AsList()[0] : null;
            }
        }

        public async Task<Booking> CancelAsync(Guid id, Guid userId)
        {
            using (var conn = (NpgsqlConnection)_factory.Create())
            {
                await conn.OpenAsync();
                using (var tx = conn.BeginTransaction())
                {
                    var booking = await conn.QueryFirstOrDefaultAsync<Booking>(
                        "SELECT id AS Id, user_id AS UserId, event_id AS EventId, status::text AS Status " +
                        "FROM bookings WHERE id = @Id AND user_id = @UserId FOR UPDATE",
                        new { Id = id, UserId = userId }, tx);

                    if (booking == null)
                        throw new AppException("Booking not found", HttpStatusCode.NotFound);

                    if (booking.Status == BookingStatus.Cancelled)
                        throw new AppException("Booking is already cancelled", HttpStatusCode.Conflict);

                    await conn.ExecuteAsync(
                        "UPDATE bookings SET status = 'cancelled' WHERE id = @Id",
                        new { Id = id }, tx);

                    await conn.ExecuteAsync(
                        "UPDATE events SET available_seats = available_seats + 1, updated_at = now() WHERE id = @EventId",
                        new { EventId = booking.EventId }, tx);

                    tx.Commit();

                    return await GetByIdAsync(id);
                }
            }
        }
    }
}
