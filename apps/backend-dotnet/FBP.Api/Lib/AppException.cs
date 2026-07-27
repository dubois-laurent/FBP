using System;
using System.Net;

namespace FBP.Api.Lib
{
    public class AppException : Exception
    {
        public HttpStatusCode StatusCode { get; }

        public AppException(string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest)
            : base(message)
        {
            StatusCode = statusCode;
        }

        public AppException(string message, int statusCode)
            : base(message)
        {
            StatusCode = (HttpStatusCode)statusCode;
        }
    }
}
