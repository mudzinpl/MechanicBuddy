using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace MechanicBuddy.Core.Application.Authorization
{
    public class AppRoleAuthorizationFilter : IActionFilter
    {
        private static readonly string[] TechnicalSettingsPrefixes =
        {
            "/api/options",
            "/api/branding",
            "/api/integrations",
            "/api/usermanagement"
        };

        private static readonly string[] ReadOnlyWriteExceptions =
        {
            "/api/users/extendsession"
        };

        public void OnActionExecuting(ActionExecutingContext context)
        {
            var request = context.HttpContext.Request;
            var path = request.Path.Value ?? string.Empty;
            var method = request.Method ?? string.Empty;

            if (!context.HttpContext.User?.Identity?.IsAuthenticated ?? true)
            {
                return;
            }

            if (AppRoles.IsReadOnly(context.HttpContext.User) && IsWriteMethod(method) && !IsReadOnlyWriteException(path))
            {
                context.Result = new ForbidResult();
                return;
            }

            if (IsTechnicalSettingsPath(path) && !AppRoles.IsAdministrator(context.HttpContext.User))
            {
                context.Result = new ForbidResult();
            }
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
        }

        private static bool IsWriteMethod(string method)
        {
            return string.Equals(method, "POST", StringComparison.OrdinalIgnoreCase)
                || string.Equals(method, "PUT", StringComparison.OrdinalIgnoreCase)
                || string.Equals(method, "PATCH", StringComparison.OrdinalIgnoreCase)
                || string.Equals(method, "DELETE", StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsTechnicalSettingsPath(string path)
        {
            return TechnicalSettingsPrefixes.Any(prefix => path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));
        }

        private static bool IsReadOnlyWriteException(string path)
        {
            return ReadOnlyWriteExceptions.Any(prefix => path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));
        }
    }
}
