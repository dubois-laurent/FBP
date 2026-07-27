using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens;
using System.Net;
using System.Security.Claims;
using System.Text;
using FBP.Api.Config;
using FBP.Api.Lib;

namespace FBP.Api.Services
{
    public class JwtService : IJwtService
    {
        public string GenerateAccessToken(string userId, string email, string role)
        {
            var claims = new List<Claim>
            {
                new Claim("sub", userId),
                new Claim("email", email),
                new Claim("role", role),
                new Claim("type", "access")
            };
            return CreateToken(claims, AppSettings.JwtAccessSecret, AppSettings.JwtAccessExpiresInMinutes);
        }

        public string GenerateRefreshToken(string userId)
        {
            var claims = new List<Claim>
            {
                new Claim("sub", userId),
                new Claim("type", "refresh")
            };
            return CreateToken(claims, AppSettings.JwtRefreshSecret, AppSettings.JwtRefreshExpiresInMinutes);
        }

        public string ValidateRefreshToken(string token)
        {
            var keyBytes = Encoding.UTF8.GetBytes(AppSettings.JwtRefreshSecret);
            var signingKey = new InMemorySymmetricSecurityKey(keyBytes);

            var parameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                IssuerSigningKey = signingKey
            };

            try
            {
                var handler = new JwtSecurityTokenHandler();
                SecurityToken validatedToken;
                var principal = handler.ValidateToken(token, parameters, out validatedToken);

                var typeClaim = principal.FindFirst("type");
                if (typeClaim == null || typeClaim.Value != "refresh")
                    throw new AppException("Invalid token type", HttpStatusCode.Unauthorized);

                var subClaim = principal.FindFirst("sub");
                if (subClaim == null)
                    throw new AppException("Invalid token", HttpStatusCode.Unauthorized);

                return subClaim.Value;
            }
            catch (AppException)
            {
                throw;
            }
            catch (Exception)
            {
                throw new AppException("Invalid or expired refresh token", HttpStatusCode.Unauthorized);
            }
        }

        private static string CreateToken(IEnumerable<Claim> claims, string secret, int expiresInMinutes)
        {
            var keyBytes = Encoding.UTF8.GetBytes(secret);
            var signingKey = new InMemorySymmetricSecurityKey(keyBytes);
            var signingCredentials = new SigningCredentials(
                signingKey,
                SecurityAlgorithms.HmacSha256Signature,
                SecurityAlgorithms.Sha256Digest);

            var token = new JwtSecurityToken(
                issuer: null,
                audience: null,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiresInMinutes),
                signingCredentials: signingCredentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
