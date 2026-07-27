using System;
using System.Net;
using System.Threading.Tasks;
using BCrypt.Net;
using FBP.Api.Data.Repositories;
using FBP.Api.DTOs.Auth;
using FBP.Api.DTOs.Users;
using FBP.Api.Lib;
using FBP.Api.Models;

namespace FBP.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepo;
        private readonly IJwtService _jwtService;

        public AuthService(IUserRepository userRepo, IJwtService jwtService)
        {
            _userRepo = userRepo;
            _jwtService = jwtService;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            var existing = await _userRepo.FindByEmailAsync(request.Email);
            if (existing != null)
                throw new AppException("Email already in use", HttpStatusCode.Conflict);

            var hash = BCrypt.Net.BCrypt.HashPassword(request.Password, 12);
            var user = await _userRepo.CreateAsync(request.Name, request.Email, hash, UserRole.User, null);

            return BuildAuthResponse(user);
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userRepo.FindByEmailAsync(request.Email);
            if (user == null)
                throw new AppException("Invalid credentials", HttpStatusCode.Unauthorized);

            if (string.IsNullOrEmpty(user.Password))
                throw new AppException("Please login with Google", HttpStatusCode.Unauthorized);

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
                throw new AppException("Invalid credentials", HttpStatusCode.Unauthorized);

            return BuildAuthResponse(user);
        }

        public async Task<AuthResponse> RefreshAsync(string refreshToken)
        {
            var userId = _jwtService.ValidateRefreshToken(refreshToken);
            Guid id;
            if (!Guid.TryParse(userId, out id))
                throw new AppException("Invalid token", HttpStatusCode.Unauthorized);

            var user = await _userRepo.FindByIdAsync(id);
            if (user == null)
                throw new AppException("User not found", HttpStatusCode.Unauthorized);

            return BuildAuthResponse(user);
        }

        public async Task<AuthResponse> HandleGoogleLoginAsync(string googleId, string email, string name)
        {
            // Try to find by Google ID
            var user = await _userRepo.FindByGoogleIdAsync(googleId);
            if (user != null)
                return BuildAuthResponse(user);

            // Try to find by email (link accounts)
            user = await _userRepo.FindByEmailAsync(email);
            if (user != null)
            {
                user = await _userRepo.UpdateAsync(user.Id, null, null, googleId);
                return BuildAuthResponse(user);
            }

            // Create new user
            user = await _userRepo.CreateAsync(name, email, null, UserRole.User, googleId);
            return BuildAuthResponse(user);
        }

        private AuthResponse BuildAuthResponse(User user)
        {
            var accessToken = _jwtService.GenerateAccessToken(user.Id.ToString(), user.Email, user.Role);
            var refreshToken = _jwtService.GenerateRefreshToken(user.Id.ToString());

            return new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = new UserResponse
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role
                }
            };
        }
    }
}
