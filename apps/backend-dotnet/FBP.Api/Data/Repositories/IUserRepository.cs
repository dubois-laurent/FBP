using System;
using System.Threading.Tasks;
using FBP.Api.Models;

namespace FBP.Api.Data.Repositories
{
    public interface IUserRepository
    {
        Task<User> FindByIdAsync(Guid id);
        Task<User> FindByEmailAsync(string email);
        Task<User> FindByGoogleIdAsync(string googleId);
        Task<User> CreateAsync(string name, string email, string password, string role, string googleId);
        Task<User> UpdateAsync(Guid id, string name, string password, string googleId);
    }
}
