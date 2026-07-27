using System;
using System.IdentityModel.Tokens;
using System.Linq;
using System.Text;
using FBP.Api.Config;
using Microsoft.AspNet.SignalR;

namespace FBP.Api.Hubs
{
    /// <summary>
    /// Extracts the userId (sub claim) from the JWT passed as ?token= query string.
    /// This is used by SignalR for Clients.User(userId) addressing.
    /// </summary>
    public class ChatUserIdProvider : IUserIdProvider
    {
        public string GetUserId(IRequest request)
        {
            var token = request.QueryString["token"];
            if (string.IsNullOrEmpty(token))
                return null;

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwt = handler.ReadToken(token) as JwtSecurityToken;
                return jwt?.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
            }
            catch
            {
                return null;
            }
        }
    }
}
