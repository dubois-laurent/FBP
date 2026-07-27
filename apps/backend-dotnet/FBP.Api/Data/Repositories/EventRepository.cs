using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using FBP.Api.Models;

namespace FBP.Api.Data.Repositories
{
    public class EventRepository : IEventRepository
    {
        private const string SelectFields =
            "id AS Id, title AS Title, description AS Description, " +
            "date AS Date, venue AS Venue, " +
            "total_seats AS TotalSeats, available_seats AS AvailableSeats, " +
            "image_url AS ImageUrl, type::text AS Type, " +
            "created_at AS CreatedAt, updated_at AS UpdatedAt";

        private readonly IDbConnectionFactory _factory;

        public EventRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }

        public async Task<(IEnumerable<Event> Events, int Total)> GetAllAsync(
            int page, int limit, string type, string date)
        {
            var offset = (page - 1) * limit;
            var whereType = !string.IsNullOrEmpty(type) ? "AND type::text = @Type" : "";
            var whereDate = !string.IsNullOrEmpty(date) ? "AND DATE(date) = @Date::date" : "";
            var where = $"WHERE 1=1 {whereType} {whereDate}";

            var countSql = $"SELECT COUNT(*) FROM events {where}";
            var dataSql =
                $"SELECT {SelectFields} FROM events {where} " +
                "ORDER BY date ASC LIMIT @Limit OFFSET @Offset";

            var param = new { Type = type, Date = date, Limit = limit, Offset = offset };

            using (var conn = _factory.Create())
            {
                conn.Open();
                var total = await conn.ExecuteScalarAsync<int>(countSql, param);
                var events = await conn.QueryAsync<Event>(dataSql, param);
                return (events, total);
            }
        }

        public async Task<Event> GetByIdAsync(Guid id)
        {
            using (var conn = _factory.Create())
            {
                conn.Open();
                return await conn.QueryFirstOrDefaultAsync<Event>(
                    $"SELECT {SelectFields} FROM events WHERE id = @Id",
                    new { Id = id });
            }
        }

        public async Task<Event> CreateAsync(string title, string description, DateTime date,
            string venue, int totalSeats, string imageUrl, string type)
        {
            var id = Guid.NewGuid();
            using (var conn = _factory.Create())
            {
                conn.Open();
                await conn.ExecuteAsync(
                    "INSERT INTO events (id, title, description, date, venue, total_seats, available_seats, image_url, type, created_at, updated_at) " +
                    "VALUES (@Id, @Title, @Description, @Date, @Venue, @TotalSeats, @TotalSeats, @ImageUrl, @Type::event_type, now(), now())",
                    new
                    {
                        Id = id, Title = title, Description = description, Date = date,
                        Venue = venue, TotalSeats = totalSeats,
                        ImageUrl = (object)imageUrl ?? DBNull.Value, Type = type
                    });

                return await GetByIdAsync(id);
            }
        }

        public async Task<Event> UpdateAsync(Guid id, string title, string description,
            DateTime? date, string venue, int? totalSeats, string imageUrl, string type)
        {
            using (var conn = _factory.Create())
            {
                conn.Open();
                await conn.ExecuteAsync(
                    "UPDATE events SET " +
                    "  title = COALESCE(@Title, title), " +
                    "  description = COALESCE(@Description, description), " +
                    "  date = COALESCE(@Date, date), " +
                    "  venue = COALESCE(@Venue, venue), " +
                    "  total_seats = COALESCE(@TotalSeats, total_seats), " +
                    "  image_url = COALESCE(@ImageUrl, image_url), " +
                    "  type = COALESCE(@Type::event_type, type), " +
                    "  updated_at = now() " +
                    "WHERE id = @Id",
                    new
                    {
                        Id = id, Title = (object)title ?? DBNull.Value,
                        Description = (object)description ?? DBNull.Value,
                        Date = (object)date ?? DBNull.Value,
                        Venue = (object)venue ?? DBNull.Value,
                        TotalSeats = (object)totalSeats ?? DBNull.Value,
                        ImageUrl = (object)imageUrl ?? DBNull.Value,
                        Type = (object)type ?? DBNull.Value
                    });

                return await GetByIdAsync(id);
            }
        }

        public async Task DeleteAsync(Guid id)
        {
            using (var conn = _factory.Create())
            {
                conn.Open();
                await conn.ExecuteAsync("DELETE FROM events WHERE id = @Id", new { Id = id });
            }
        }
    }
}
