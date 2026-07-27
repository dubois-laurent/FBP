using Newtonsoft.Json;
using FBP.Api.DTOs.Users;

namespace FBP.Api.DTOs.Auth
{
    public class AuthResponse
    {
        [JsonProperty("accessToken")]
        public string AccessToken { get; set; }

        [JsonProperty("refreshToken")]
        public string RefreshToken { get; set; }

        [JsonProperty("user")]
        public UserResponse User { get; set; }
    }

    public class RefreshRequest
    {
        [JsonProperty("refreshToken")]
        public string RefreshToken { get; set; }
    }
}
