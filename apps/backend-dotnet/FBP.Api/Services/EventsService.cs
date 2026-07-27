using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using FBP.Api.Data.Repositories;
using FBP.Api.DTOs.Events;
using FBP.Api.Lib;
using FBP.Api.Models;

namespace FBP.Api.Services
{
    public class EventsService : IEventsService
    {
        private readonly IEventRepository _eventRepo;

        public EventsService(IEventRepository eventRepo)
        {
            _eventRepo = eventRepo;
        }

        public async Task<(IEnumerable<EventResponse> Events, int Total)> GetAllAsync(
            int page, int limit, string type, string date)
        {
            var (events, total) = await _eventRepo.GetAllAsync(page, limit, type, date);
            return (events.Select(MapToResponse), total);
        }

        public async Task<EventResponse> GetByIdAsync(string id)
        {
            var evt = await _eventRepo.GetByIdAsync(ParseGuid(id));
            if (evt == null)
                throw new AppException("Event not found", HttpStatusCode.NotFound);
            return MapToResponse(evt);
        }

        public async Task<EventResponse> CreateAsync(CreateEventRequest request)
        {
            var date = DateTime.Parse(request.Date).ToUniversalTime();
            var evt = await _eventRepo.CreateAsync(
                request.Title, request.Description, date,
                request.Venue, request.TotalSeats, request.ImageUrl, request.Type.ToLowerInvariant());
            return MapToResponse(evt);
        }

        public async Task<EventResponse> UpdateAsync(string id, UpdateEventRequest request)
        {
            var guid = ParseGuid(id);
            var existing = await _eventRepo.GetByIdAsync(guid);
            if (existing == null)
                throw new AppException("Event not found", HttpStatusCode.NotFound);

            DateTime? date = null;
            if (!string.IsNullOrEmpty(request.Date))
                date = DateTime.Parse(request.Date).ToUniversalTime();

            var evt = await _eventRepo.UpdateAsync(
                guid, request.Title, request.Description, date,
                request.Venue, request.TotalSeats, request.ImageUrl,
                request.Type?.ToLowerInvariant());

            return MapToResponse(evt);
        }

        public async Task DeleteAsync(string id)
        {
            var guid = ParseGuid(id);
            var existing = await _eventRepo.GetByIdAsync(guid);
            if (existing == null)
                throw new AppException("Event not found", HttpStatusCode.NotFound);
            await _eventRepo.DeleteAsync(guid);
        }

        private static Guid ParseGuid(string id)
        {
            Guid guid;
            if (!Guid.TryParse(id, out guid))
                throw new AppException("Invalid event ID", HttpStatusCode.BadRequest);
            return guid;
        }

        private static EventResponse MapToResponse(Event e)
        {
            return new EventResponse
            {
                Id = e.Id, Title = e.Title, Description = e.Description,
                Date = e.Date, Venue = e.Venue, TotalSeats = e.TotalSeats,
                AvailableSeats = e.AvailableSeats, ImageUrl = e.ImageUrl,
                Type = e.Type, CreatedAt = e.CreatedAt, UpdatedAt = e.UpdatedAt
            };
        }
    }
}
