using Autofac;

namespace FBP.Api.Config
{
    /// <summary>
    /// Holds the shared Autofac container built at startup.
    /// Web API and SignalR both use this container.
    /// </summary>
    public static class DependencyConfig
    {
        public static IContainer Container { get; set; }
    }
}
