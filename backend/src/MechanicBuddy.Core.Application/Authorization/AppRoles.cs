using System;
using System.Collections.Generic;
using System.Security.Claims;

namespace MechanicBuddy.Core.Application.Authorization
{
    public static class AppRoles
    {
        public const string ClaimType = "app_role";
        public const string Administrator = "administrator";
        public const string Manager = "manager";
        public const string Board = "board";
        public const string Office = "office";
        public const string Technician = "technician";
        public const string Assessor = "assessor";
        public const string ReadOnly = "readonly";

        public static readonly ISet<string> All = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            Administrator,
            Manager,
            Board,
            Office,
            Technician,
            Assessor,
            ReadOnly
        };

        public static string Normalize(string role, bool isDefaultAdmin = false)
        {
            if (isDefaultAdmin)
            {
                return Administrator;
            }

            if (string.IsNullOrWhiteSpace(role))
            {
                return Manager;
            }

            var normalized = role.Trim().ToLowerInvariant();
            return All.Contains(normalized) ? normalized : Manager;
        }

        public static string GetRole(ClaimsPrincipal user)
        {
            return Normalize(user?.FindFirst(ClaimType)?.Value);
        }

        public static bool IsAdministrator(ClaimsPrincipal user)
        {
            return string.Equals(GetRole(user), Administrator, StringComparison.OrdinalIgnoreCase);
        }

        public static bool IsReadOnly(ClaimsPrincipal user)
        {
            return string.Equals(GetRole(user), ReadOnly, StringComparison.OrdinalIgnoreCase);
        }
    }
}
