using System.Data;
using FBP.Api.Config;
using Npgsql;

namespace FBP.Api.Data
{
    public class NpgsqlConnectionFactory : IDbConnectionFactory
    {
        private readonly string _connectionString;

        public NpgsqlConnectionFactory()
        {
            _connectionString = AppSettings.DatabaseConnectionString;
        }

        public IDbConnection Create()
        {
            return new NpgsqlConnection(_connectionString);
        }
    }
}
