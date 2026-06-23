using MechanicBuddy.Core.Application;
using MechanicBuddy.Core.Application.Authorization;
using MechanicBuddy.Core.Application.Configuration;
using MechanicBuddy.Core.Application.Database;
using MechanicBuddy.Core.Application.Model;
using MechanicBuddy.Core.Domain;
using MechanicBuddy.Http.Api.Models;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using NHibernate;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Net.Mail;
using System.Reflection;
using System.Threading.Tasks;

namespace MechanicBuddy.Core.Repository.Postgres
{
    /// <summary>
    /// TODO, transaction handling and separate connection handling .. kinda special case but without multitenancy it should work as normal .. needs to implemented better
    /// </summary>
    public class UserRepository :  IUserRepository
    {
        private readonly DbOptions dbOptions;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private const string UserSelectQuery =
            "SELECT profile_image as ProfileImage, UserName, Password, TenantName, Email, Validated, EmployeeId, COALESCE(app_role, 'manager') as AppRole FROM public.user";

        public UserRepository(Microsoft.Extensions.Options.IOptions<DbOptions> dbOptions, IHttpContextAccessor httpContextAccessor = null)
        {
            this.dbOptions = dbOptions.Value;
            this._httpContextAccessor = httpContextAccessor;
        }

        public User GetBy(string userName)
        {
            if (dbOptions.MultiTenancy?.Enabled == true)
            {
                var tenantId = ResolveTenantId();
                if (!string.IsNullOrEmpty(tenantId))
                {
                    return QuerySingleUser(
                        $"{UserSelectQuery} WHERE UserName = @UserName AND TenantName = @TenantName",
                        new { UserName = userName, TenantName = tenantId });
                }
            }
            return QuerySingleUser($"{UserSelectQuery} WHERE UserName = @UserName", new { UserName = userName });
        }

        private string ResolveTenantId()
        {
            if (!string.IsNullOrEmpty(dbOptions.MultiTenancy?.TenantId))
            {
                return dbOptions.MultiTenancy.TenantId;
            }

            var httpContext = _httpContextAccessor?.HttpContext;
            if (httpContext == null)
            {
                return null;
            }

            if (httpContext.Request?.Headers?.TryGetValue("X-Tenant-ID", out var tenantIdHeader) == true)
            {
                var headerValue = tenantIdHeader.ToString();
                if (!string.IsNullOrEmpty(headerValue))
                {
                    return headerValue;
                }
            }

            if (httpContext.Request?.Headers?.TryGetValue("X-Forwarded-Host", out var forwardedHost) == true)
            {
                var host = forwardedHost.ToString();
                if (!string.IsNullOrEmpty(host))
                {
                    var parts = host.Split('.');
                    if (parts.Length >= 2 && !string.IsNullOrEmpty(parts[0]) && parts[0] != "www" && parts[0] != "api")
                    {
                        return parts[0];
                    }
                }
            }

            if (httpContext.Request?.Host.Host != null)
            {
                var host = httpContext.Request.Host.Host;
                var parts = host.Split('.');
                if (parts.Length >= 2 && !string.IsNullOrEmpty(parts[0]) && parts[0] != "www" && parts[0] != "api")
                {
                    return parts[0];
                }
            }

            return null;
        }

        public User GetByEmail(string email)
        {
            if (dbOptions.MultiTenancy?.Enabled == true)
            {
                var tenantId = ResolveTenantId();
                if (!string.IsNullOrEmpty(tenantId))
                {
                    return QuerySingleUser(
                        $"{UserSelectQuery} WHERE Email = @Email AND TenantName = @TenantName",
                        new { Email = email, TenantName = tenantId });
                }
            }
            return QuerySingleUser($"{UserSelectQuery} WHERE Email = @Email", new { Email = email });
        }

        public User GetBy(UserIdentifier id)
        {
            return QuerySingleUser(
                $"{UserSelectQuery} WHERE EmployeeId = @EmployeeId AND TenantName = @TenantName",
                new { EmployeeId = id.EmployeeId, TenantName = id.TenantName });
        }

        public string GetFullName(string userName)
        {
            if (string.IsNullOrEmpty(userName))
                throw new ArgumentNullException(nameof(userName));

            var user = GetBy(userName);
            if (user == null)
                return null;

            return GetFullName(user.Id);
        }

        private string GetFullName(UserIdentifier id)
        {
            if (id == null)
                throw new ArgumentNullException(nameof(id));

            using (var connection = CreateConnection(GetUserDatabase(id.TenantName)))
            {
                var fullName = connection.QuerySingleOrDefault<string>(
                    "SELECT CONCAT(FirstName, ' ', LastName) FROM domain.employee WHERE Id = @EmployeeId",
                    new { EmployeeId = id.EmployeeId });

                return fullName;
            }
        }

        private User QuerySingleUser(string query, object parameters)
        {
            using var connection = CreateConnection(GetUserListDatabase());

            var user = connection.QuerySingleOrDefault<UserDto>(query, parameters);

            if (user == null)
                return null;

            return new User(
                user.UserName,
                user.Password,
                user.Email,
                user.Validated,
                user.ProfileImage,
                new UserIdentifier(user.TenantName, user.EmployeeId),
                user.AppRole);
        }

        public void Add(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            if (user.Id == null)
                throw new ArgumentException("Cannot add user without a valid identifier");

            using (var connection = CreateConnection(GetUserListDatabase()))
            {
                connection.Execute(
                    @"INSERT INTO public.user (tenantname, employeeid, username, password, email, validated, profile_image, app_role)
                      VALUES (@TenantName, @EmployeeId, @UserName, @Password, @Email, @Validated, @ProfileImage, @AppRole)",
                    new
                    {
                        TenantName = user.Id.TenantName,
                        EmployeeId = user.Id.EmployeeId,
                        UserName = user.UserName,
                        Password = user.Password,
                        Email = user.Email,
                        Validated = user.Validated,
                        ProfileImage = user.ProfileImage,
                        AppRole = AppRoles.Normalize(user.AppRole)
                    });
            }
        }

        public void Update(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            if (user.Id == null)
                throw new ArgumentException("Cannot update user without a valid identifier");

            using (var connection = CreateConnection(GetUserListDatabase()))
            {
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        int rowsAffected = connection.Execute(
                            @"UPDATE public.user 
                              SET UserName = @UserName, 
                                  Password = @Password, 
                                  Email = @Email, 
                                  Validated = @Validated, 
                                  Profile_Image = @ProfileImage,
                                  app_role = CASE WHEN COALESCE(is_default_admin, false) THEN 'administrator' ELSE @AppRole END
                              WHERE TenantName = @TenantName AND EmployeeId = @EmployeeId",
                            new
                            {
                                UserName = user.UserName,
                                Password = user.Password,
                                Email = user.Email,
                                Validated = user.Validated,
                                ProfileImage = user.ProfileImage,
                                AppRole = AppRoles.Normalize(user.AppRole),
                                TenantName = user.Id.TenantName,
                                EmployeeId = user.Id.EmployeeId
                            });

                        if (rowsAffected == 0)
                        {
                            throw new EntityNotFoundException($"User with ID {user.Id.TenantName}/{user.Id.EmployeeId} not found");
                        }

                        transaction.Commit();
                    }
                    catch (Exception)
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }

        public IEnumerable<User> GetAllByTenant(string tenantName)
        {
            using (var connection = CreateConnection(GetUserListDatabase()))
            {
                var users = connection.Query<UserDto>(
                    $"{UserSelectQuery} WHERE TenantName = @TenantName",
                    new { TenantName = tenantName });

                foreach (var user in users)
                {
                    yield return new User(
                        user.UserName,
                        user.Password,
                        user.Email,
                        user.Validated,
                        user.ProfileImage,
                        new UserIdentifier(user.TenantName, user.EmployeeId),
                        user.AppRole);
                }
            }
        }

        private string GetUserListDatabase()
        {
            string databaseName = dbOptions.MultiTenancy?.Enabled == true
                ? new MultiTenancyDbName(dbOptions, DbKind.Tenancy)
                : dbOptions.Name;

            return databaseName;
        }

        private string GetUserDatabase(string tenantName)
        {
            if (dbOptions.MultiTenancy?.Enabled == true)
            {
                return new MultiTenancyDbName(dbOptions, tenantName);
            }

            return dbOptions.Name;
        }

        private DbConnection CreateConnection(string databaseName)
        {
            var connectionBuilder = new Npgsql.NpgsqlConnectionStringBuilder
            {
                Host = dbOptions.Host,
                Port = dbOptions.Port,
                Username = dbOptions.UserId,
                Password = dbOptions.Password,
                Database = databaseName
            };

            var connection = new Npgsql.NpgsqlConnection(connectionBuilder.ToString());
            connection.Open();
            return connection;
        }
    }
}