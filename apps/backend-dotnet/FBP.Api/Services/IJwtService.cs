namespace FBP.Api.Services
{
    public interface IJwtService
    {
        string GenerateAccessToken(string userId, string email, string role);
        string GenerateRefreshToken(string userId);
        string ValidateRefreshToken(string token);
    }
}
