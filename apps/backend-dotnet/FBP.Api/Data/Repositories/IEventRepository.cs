using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FBP.Api.Models;

namespace FBP.Api.Data.Repositories
{
    public interface IEventRepository
    {
        Task<(IEnumerable<Event> Events, int Total)> GetAllAsync(int page, int limit, string type, string date);
        Task<Event> GetByIdAsync(Guid id);
        Task<Event> CreateAsync(string title, string description, DateTime date, string venue,
                                int totalSeats, string imageUrl, string type);
        Task<Event> UpdateAsync(Guid id, string title, string description, DateTime? date,
                                string venue, int? totalSeats, string imageUrl, string type);
        Task DeleteAsync(Guid id);
    }
}
