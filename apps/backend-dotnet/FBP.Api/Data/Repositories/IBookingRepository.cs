using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FBP.Api.Models;

namespace FBP.Api.Data.Repositories
{
    public interface IBookingRepository
    {
        Task<Booking> CreateAsync(Guid userId, Guid eventId);
        Task<IEnumerable<Booking>> GetByUserAsync(Guid userId);
        Task<Booking> GetByIdAsync(Guid id);
        Task<Booking> CancelAsync(Guid id, Guid userId);
    }
}
