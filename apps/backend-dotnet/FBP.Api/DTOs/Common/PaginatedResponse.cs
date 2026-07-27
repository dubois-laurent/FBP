using System.Collections.Generic;
using Newtonsoft.Json;

namespace FBP.Api.DTOs.Common
{
    public class PaginationMeta
    {
        [JsonProperty("page")]
        public int Page { get; set; }

        [JsonProperty("limit")]
        public int Limit { get; set; }

        [JsonProperty("total")]
        public int Total { get; set; }

        [JsonProperty("totalPages")]
        public int TotalPages { get; set; }
    }

    public class PaginatedResponse<T>
    {
        [JsonProperty("success")]
        public bool Success { get; set; }

        [JsonProperty("data")]
        public IEnumerable<T> Data { get; set; }

        [JsonProperty("pagination")]
        public PaginationMeta Pagination { get; set; }

        public static PaginatedResponse<T> Ok(IEnumerable<T> data, int total, int page, int limit)
        {
            var totalPages = limit > 0 ? (total + limit - 1) / limit : 0;
            return new PaginatedResponse<T>
            {
                Success = true,
                Data = data,
                Pagination = new PaginationMeta
                {
                    Page = page,
                    Limit = limit,
                    Total = total,
                    TotalPages = totalPages
                }
            };
        }
    }
}
