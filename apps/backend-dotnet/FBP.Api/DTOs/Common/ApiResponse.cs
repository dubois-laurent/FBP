using Newtonsoft.Json;

namespace FBP.Api.DTOs.Common
{
    public class ApiResponse<T>
    {
        [JsonProperty("success")]
        public bool Success { get; set; }

        [JsonProperty("data")]
        public T Data { get; set; }

        [JsonProperty("message")]
        public string Message { get; set; }

        public static ApiResponse<T> Ok(T data, string message = null)
        {
            return new ApiResponse<T> { Success = true, Data = data, Message = message };
        }

        public static ApiResponse<object> Fail(string message)
        {
            return new ApiResponse<object> { Success = false, Message = message };
        }
    }
}
