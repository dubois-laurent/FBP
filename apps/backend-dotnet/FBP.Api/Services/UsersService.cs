using System;
using System.Net;
using System.Threading.Tasks;
using BCrypt.Net;
using FBP.Api.Data.Repositories;
using FBP.Api.DTOs.Users;
using FBP.Api.Lib;

namespace FBP.Api.Services
{
    public class UsersService : IUsersService
    {
        private readonly IUserRepository _userRepo;

        public UsersService(IUserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        public async Task<UserResponse> GetProfileAsync(Guid userId)
        {
            var user = await _userRepo.FindByIdAsync(userId);
            if (user == null)
                throw new AppException("User not found", HttpStatusCode.NotFound);

            return new UserResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            };
        }

        public async Task<UserResponse> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
        {
            var user = await _userRepo.FindByIdAsync(userId);
            if (user == null)
                throw new AppException("User not found", HttpStatusCode.NotFound);

            string hashedPassword = null;
            if (!string.IsNullOrEmpty(request.Password))
                hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password, 12);

            user = await _userRepo.UpdateAsync(userId, request.Name, hashedPassword, null);

            return new UserResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            };
        }
    }
}
