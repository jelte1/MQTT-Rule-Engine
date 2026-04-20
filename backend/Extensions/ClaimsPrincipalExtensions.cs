using System.Security.Claims;

namespace backend.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static string GetLoggedInUserId(this ClaimsPrincipal principal)
    {
        if (principal == null)
            throw new ArgumentNullException(nameof(principal));

        var loggedInUserId = principal.FindFirstValue(ClaimTypes.NameIdentifier);

        if (loggedInUserId != null)
        {
            return loggedInUserId;
        } 
        else
        {
            throw new Exception("Invalid type provided");
        }
    }
}