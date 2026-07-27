using System.Collections.Generic;
using System.Threading.Tasks;
using FBP.Api.DTOs.Events;

namespace FBP.Api.Services
{
    public interface IEventsService
    {
        Task<(IEnumerable<EventResponse> Events, int Total)> GetAllAsync(int page, int limit, string type, string date);
        Task<EventResponse> GetByIdAsync(string id);
        Task<EventResponse> CreateAsync(CreateEventRequest request);
        Task<EventResponse> UpdateAsync(string id, UpdateEventRequest request);
        Task DeleteAsync(string id);
    }
}
