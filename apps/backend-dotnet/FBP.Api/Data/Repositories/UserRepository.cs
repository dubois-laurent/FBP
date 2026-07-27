using System;
using System.Threading.Tasks;
using Dapper;
using FBP.Api.Models;

namespace FBP.Api.Data.Repositories
{
    public class UserRepository : IUserRepository
    {
        private const string SelectFields =
            "id AS Id, name AS Name, email AS Email, password AS Password, " +
            "role::text AS Role, google_id AS GoogleId, " +
            "created_at AS CreatedAt, updated_at AS UpdatedAt";

        private readonly IDbConnectionFactory _factory;

        public UserRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }

        public async Task<User> FindByIdAsync(Guid id)
        {
            using (var conn = _factory.Create())
            {
                conn.Open();
                return await conn.QueryFirstOrDefaultAsync<User>(
                    $"SELECT {SelectFields} FROM users WHERE id = @Id",
                    new { Id = id });
            }
        }

        public async Task<User> FindByEmailAsync(string email)
        {
            using (var conn = _factory.Create())
            {
                conn.Open();
                return await conn.QueryFirstOrDefaultAsync<User>(
                    $"SELECT {SelectFields} FROM users WHERE email = @Email",
                    new { Email = email });
            }
        }

        public async Task<User> FindByGoogleIdAsync(string googleId)
        {
            using (var conn = _factory.Create())
            {
                conn.Open();
                return await conn.QueryFirstOrDefaultAsync<User>(
                    $"SELECT {SelectFields} FROM users WHERE google_id = @GoogleId",
                    new { GoogleId = googleId });
            }
        }

        public async Task<User> CreateAsync(string name, string email, string password, string role, string googleId)
        {
            var id = Guid.NewGuid();
            using (var conn = _factory.Create())
            {
                conn.Open();
                await conn.ExecuteAsync(
                    "INSERT INTO users (id, name, email, password, role, google_id, created_at, updated_at) " +
                    "VALUES (@Id, @Name, @Email, @Password, @Role::role, @GoogleId, now(), now())",
                    new { Id = id, Name = name, Email = email, Password = password, Role = role, GoogleId = (object)googleId ?? DBNull.Value });

                return await FindByIdAsync(id);
            }
        }

        public async Task<User> UpdateAsync(Guid id, string name, string password, string googleId)
        {
            using (var conn = _factory.Create())
            {
                conn.Open();
                await conn.ExecuteAsync(
                    "UPDATE users SET " +
                    "  name = COALESCE(@Name, name), " +
                    "  password = COALESCE(@Password, password), " +
                    "  google_id = COALESCE(@GoogleId, google_id), " +
                    "  updated_at = now() " +
                    "WHERE id = @Id",
                    new
                    {
                        Id = id,
                        Name = (object)name ?? DBNull.Value,
                        Password = (object)password ?? DBNull.Value,
                        GoogleId = (object)googleId ?? DBNull.Value
                    });

                return await FindByIdAsync(id);
            }
        }
    }
}
