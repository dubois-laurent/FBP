using System;
using System.Threading.Tasks;
using FBP.Api.DTOs.Users;

namespace FBP.Api.Services
{
    public interface IUsersService
    {
        Task<UserResponse> GetProfileAsync(Guid userId);
        Task<UserResponse> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
    }
}
