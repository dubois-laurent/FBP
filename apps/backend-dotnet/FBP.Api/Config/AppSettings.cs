using System;
using System.Configuration;

namespace FBP.Api.Config
{
    public static class AppSettings
    {
        public static string JwtAccessSecret
        {
            get
            {
                var v = ConfigurationManager.AppSettings["JWT_ACCESS_SECRET"];
                if (string.IsNullOrEmpty(v))
                    throw new InvalidOperationException("JWT_ACCESS_SECRET is not configured");
                return v;
            }
        }

        public static string JwtRefreshSecret
        {
            get
            {
                var v = ConfigurationManager.AppSettings["JWT_REFRESH_SECRET"];
                if (string.IsNullOrEmpty(v))
                    throw new InvalidOperationException("JWT_REFRESH_SECRET is not configured");
                return v;
            }
        }

        public static int JwtAccessExpiresInMinutes
        {
            get
            {
                int result;
                return int.TryParse(ConfigurationManager.AppSettings["JWT_ACCESS_EXPIRES_IN"], out result)
                    ? result : 15;
            }
        }

        public static int JwtRefreshExpiresInMinutes
        {
            get
            {
                int result;
                return int.TryParse(ConfigurationManager.AppSettings["JWT_REFRESH_EXPIRES_IN"], out result)
                    ? result : 10080;
            }
        }

        public static string DatabaseConnectionString
        {
            get
            {
                var cs = ConfigurationManager.ConnectionStrings["DefaultConnection"]?.ConnectionString;
                if (string.IsNullOrEmpty(cs))
                    throw new InvalidOperationException("DefaultConnection is not configured");
                return cs;
            }
        }

        public static string GoogleClientId
        {
            get { return ConfigurationManager.AppSettings["GOOGLE_CLIENT_ID"] ?? string.Empty; }
        }

        public static string GoogleClientSecret
        {
            get { return ConfigurationManager.AppSettings["GOOGLE_CLIENT_SECRET"] ?? string.Empty; }
        }

        public static string GoogleCallbackUrl
        {
            get
            {
                return ConfigurationManager.AppSettings["GOOGLE_CALLBACK_URL"]
                    ?? "http://localhost:5000/auth/google/callback";
            }
        }

        public static string FrontendUrl
        {
            get
            {
                return ConfigurationManager.AppSettings["FRONTEND_URL"]
                    ?? "http://localhost:5173";
            }
        }
    }
}
