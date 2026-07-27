using System.Data;

namespace FBP.Api.Data
{
    public interface IDbConnectionFactory
    {
        IDbConnection Create();
    }
}
