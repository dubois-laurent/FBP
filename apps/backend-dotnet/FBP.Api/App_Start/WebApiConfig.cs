using System.Reflection;
using System.Web.Http;
using Autofac;
using Autofac.Integration.WebApi;
using FBP.Api.Config;
using FBP.Api.Data;
using FBP.Api.Data.Repositories;
using FBP.Api.Filters;
using FBP.Api.Hubs;
using FBP.Api.Services;
using Newtonsoft.Json.Serialization;
using WebApiThrottle;

namespace FBP.Api.App_Start
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Attribute routing
            config.MapHttpAttributeRoutes();

            // JSON camelCase serialisation
            config.Formatters.JsonFormatter.SerializerSettings.ContractResolver =
                new CamelCasePropertyNamesContractResolver();
            config.Formatters.JsonFormatter.SerializerSettings.NullValueHandling =
                Newtonsoft.Json.NullValueHandling.Ignore;

            // Global filters
            config.Filters.Add(new GlobalExceptionFilter());
            config.Filters.Add(new ValidateModelAttribute());

            // Rate limiting (applied on [EnableThrottling] actions)
            config.MessageHandlers.Add(new ThrottlingHandler
            {
                Policy = new ThrottlePolicy(perSecond: 10, perMinute: 60)
                {
                    IpThrottling = true,
                    ClientThrottling = false
                },
                Repository = new CacheRepository()
            });

            // Autofac DI container
            var builder = new ContainerBuilder();

            // Register Web API controllers
            builder.RegisterApiControllers(Assembly.GetExecutingAssembly());

            // Data
            builder.RegisterType<NpgsqlConnectionFactory>()
                   .As<IDbConnectionFactory>()
                   .SingleInstance();

            builder.RegisterType<UserRepository>()
                   .As<IUserRepository>()
                   .InstancePerDependency();
            builder.RegisterType<EventRepository>()
                   .As<IEventRepository>()
                   .InstancePerDependency();
            builder.RegisterType<BookingRepository>()
                   .As<IBookingRepository>()
                   .InstancePerDependency();
            builder.RegisterType<MessageRepository>()
                   .As<IMessageRepository>()
                   .InstancePerDependency();

            // Services
            builder.RegisterType<JwtService>()
                   .As<IJwtService>()
                   .SingleInstance();
            builder.RegisterType<AuthService>()
                   .As<IAuthService>()
                   .InstancePerDependency();
            builder.RegisterType<EventsService>()
                   .As<IEventsService>()
                   .InstancePerDependency();
            builder.RegisterType<BookingsService>()
                   .As<IBookingsService>()
                   .InstancePerDependency();
            builder.RegisterType<MessagesService>()
                   .As<IMessagesService>()
                   .InstancePerDependency();
            builder.RegisterType<UsersService>()
                   .As<IUsersService>()
                   .InstancePerDependency();

            var container = builder.Build();

            // Web API resolver
            config.DependencyResolver = new AutofacWebApiDependencyResolver(container);

            // Share container with Startup.cs for SignalR
            DependencyConfig.Container = container;

            // Swagger
            SwaggerConfig.Register(config);
        }
    }
}
