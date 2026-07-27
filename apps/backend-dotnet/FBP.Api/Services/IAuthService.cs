using System.Threading.Tasks;
using FBP.Api.DTOs.Auth;

namespace FBP.Api.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> RefreshAsync(string refreshToken);
        Task<AuthResponse> HandleGoogleLoginAsync(string googleId, string email, string name);
    }
}
