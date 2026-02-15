using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LunchAggregator.API.Data;
using LunchAggregator.API.DTOs;
using LunchAggregator.API.Models;

namespace LunchAggregator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SessionController : ControllerBase
{
    private readonly LunchDbContext _context;
    private readonly ILogger<SessionController> _logger;

    public SessionController(LunchDbContext context, ILogger<SessionController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Pobiera aktywną sesję zamawiania (jeśli istnieje)
    /// </summary>
    [HttpGet("active")]
    public async Task<ActionResult<SessionDto>> GetActiveSession()
    {
        try
        {
            var session = await _context.OrderSessions
                .Include(s => s.Restaurant)
                .Where(s => s.IsActive)
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();

            if (session == null)
            {
                return Ok(null);
            }

            var participants = string.IsNullOrWhiteSpace(session.ParticipantNames) 
                ? new List<string>() 
                : session.ParticipantNames.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();

            var sessionDto = new SessionDto
            {
                Id = session.Id,
                RestaurantId = session.RestaurantId,
                RestaurantName = session.Restaurant.Name,
                RestaurantCuisine = session.Restaurant.Cuisine,
                RestaurantImageUrl = session.Restaurant.ImageUrl,
                IsActive = session.IsActive,
                CreatedBy = session.CreatedBy,
                CreatedByClientId = session.CreatedByClientId,
                CreatedAt = session.CreatedAt,
                Participants = participants,
                ParticipantCount = participants.Count
            };

            return Ok(sessionDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching active session");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Tworzy nową sesję zamawiania (organizator wybiera restaurację)
    /// </summary>
    [HttpPost("start")]
    public async Task<ActionResult<SessionDto>> StartSession([FromBody] CreateSessionRequest request)
    {
        try
        {
            // Walidacja
            if (string.IsNullOrWhiteSpace(request.OrganizerName))
            {
                return BadRequest("Organizer name is required");
            }


            if (request.OrganizerName.Length > 100)
            {
                return BadRequest("Organizer name is too long (max 100 characters)");
            }

            // Sprawdzenie czy restauracja istnieje
            var restaurant = await _context.Restaurants.FindAsync(request.RestaurantId);
            if (restaurant == null)
            {
                return NotFound($"Restaurant with ID {request.RestaurantId} not found");
            }

            // Sprawdzenie czy jest już aktywna sesja
            var existingActiveSession = await _context.OrderSessions
                .Where(s => s.IsActive)
                .FirstOrDefaultAsync();

            if (existingActiveSession != null)
            {
                return BadRequest("There is already an active ordering session. Please close it first.");
            }

            // Tworzenie nowej sesji
            var session = new OrderSession
            {
                RestaurantId = request.RestaurantId,
                CreatedBy = request.OrganizerName.Trim(),
                CreatedByClientId = string.IsNullOrWhiteSpace(request.OrganizerClientId) ? Guid.NewGuid().ToString() : request.OrganizerClientId.Trim(),
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                ParticipantNames = request.OrganizerName.Trim() // Organizator automatycznie dołącza
            };

            _context.OrderSessions.Add(session);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Session started by {Organizer} for restaurant {RestaurantId}", 
                session.CreatedBy, session.RestaurantId);

            var sessionDto = new SessionDto
            {
                Id = session.Id,
                RestaurantId = restaurant.Id,
                RestaurantName = restaurant.Name,
                RestaurantCuisine = restaurant.Cuisine,
                RestaurantImageUrl = restaurant.ImageUrl,
                IsActive = session.IsActive,
                CreatedBy = session.CreatedBy,
                CreatedByClientId = session.CreatedByClientId,
                CreatedAt = session.CreatedAt,
                Participants = new List<string> { session.CreatedBy },
                ParticipantCount = 1
            };

            return CreatedAtAction(nameof(GetActiveSession), sessionDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting session");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Dołącza użytkownika do aktywnej sesji
    /// </summary>
    [HttpPost("join")]
    public async Task<ActionResult<SessionDto>> JoinSession([FromBody] JoinSessionRequest request)
    {
        try
        {
            // Walidacja
            if (string.IsNullOrWhiteSpace(request.PersonName))
            {
                return BadRequest("Person name is required");
            }

            if (request.PersonName.Length > 100)
            {
                return BadRequest("Person name is too long (max 100 characters)");
            }

            // Pobierz aktywną sesję
            var session = await _context.OrderSessions
                .Include(s => s.Restaurant)
                .Where(s => s.IsActive && s.Id == request.SessionId)
                .FirstOrDefaultAsync();

            if (session == null)
            {
                return NotFound("Active session not found");
            }

            var personName = request.PersonName.Trim();

            // Sprawdź czy użytkownik już nie dołączył
            var participants = string.IsNullOrWhiteSpace(session.ParticipantNames) 
                ? new List<string>() 
                : session.ParticipantNames.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();

            if (!participants.Contains(personName))
            {
                participants.Add(personName);
                session.ParticipantNames = string.Join(",", participants);
                await _context.SaveChangesAsync();
            }

            _logger.LogInformation("User {PersonName} joined session {SessionId}", personName, session.Id);

            var sessionDto = new SessionDto
            {
                Id = session.Id,
                RestaurantId = session.RestaurantId,
                RestaurantName = session.Restaurant.Name,
                RestaurantCuisine = session.Restaurant.Cuisine,
                RestaurantImageUrl = session.Restaurant.ImageUrl,
                IsActive = session.IsActive,
                CreatedBy = session.CreatedBy,
                CreatedByClientId = session.CreatedByClientId,
                CreatedAt = session.CreatedAt,
                Participants = participants,
                ParticipantCount = participants.Count
            };

            return Ok(sessionDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error joining session");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Zamyka aktywną sesję zamawiania
    /// </summary>
    [HttpPost("close")]
    public async Task<ActionResult> CloseSession([FromBody] CloseSessionRequest request)
    {
        try
        {
            var session = await _context.OrderSessions
                .Where(s => s.IsActive)
                .FirstOrDefaultAsync();

            if (session == null)
            {
                return NotFound("No active session found");
            }

            // If a client id is provided, only the creator may close the session.
            if (!string.IsNullOrWhiteSpace(request?.ClientId))
            {
                if (!string.Equals(session.CreatedByClientId, request.ClientId.Trim(), StringComparison.Ordinal))
                {
                    return Forbid("Only the session creator may close the session");
                }
            }

            session.IsActive = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Session {SessionId} closed", session.Id);

            return Ok(new { message = "Session closed successfully", sessionId = session.Id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error closing session");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Usuwa wszystkie sesje i zamówienia (reset systemu)
    /// </summary>
    [HttpDelete("clear")]
    public async Task<ActionResult> ClearAllSessions()
    {
        try
        {
            var sessions = await _context.OrderSessions.ToListAsync();
            _context.OrderSessions.RemoveRange(sessions);
            await _context.SaveChangesAsync();

            _logger.LogInformation("All sessions cleared");

            return Ok(new { message = "All sessions cleared successfully", count = sessions.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing sessions");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Umożliwia uczestnikowi opuszczenie sesji — usuwa go z listy uczestników i jego zamówienia
    /// </summary>
    [HttpPost("leave")]
    public async Task<ActionResult> LeaveSession([FromBody] LeaveSessionRequest request)
    {
        try
        {
            var session = await _context.OrderSessions
                .Where(s => s.IsActive)
                .FirstOrDefaultAsync();

            if (session == null)
            {
                return NotFound("No active session found");
            }

            var name = request?.PersonName?.Trim();
            var clientId = request?.PersonClientId?.Trim();

            // Remove from participant list by name if provided
            if (!string.IsNullOrWhiteSpace(name))
            {
                var participants = string.IsNullOrWhiteSpace(session.ParticipantNames)
                    ? new List<string>()
                    : session.ParticipantNames.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(p => p.Trim()).ToList();

                if (participants.Contains(name))
                {
                    participants.RemoveAll(p => p.Equals(name, StringComparison.Ordinal));
                    session.ParticipantNames = string.Join(',', participants);
                    await _context.SaveChangesAsync();
                }
            }

            // Delete orders belonging to this user (match by client id if available, otherwise by name)
            var ordersQuery = _context.Orders.Where(o => o.SessionId == session.Id);
            if (!string.IsNullOrWhiteSpace(clientId))
            {
                ordersQuery = ordersQuery.Where(o => o.PersonClientId == clientId);
            }
            else if (!string.IsNullOrWhiteSpace(name))
            {
                ordersQuery = ordersQuery.Where(o => o.PersonName == name);
            }

            var ordersToDelete = await ordersQuery.ToListAsync();
            if (ordersToDelete.Any())
            {
                _context.Orders.RemoveRange(ordersToDelete);
                await _context.SaveChangesAsync();
            }

            _logger.LogInformation("User left session: {Name} (clientId={ClientId})", name, clientId);

            return Ok(new { message = "Left session successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error leaving session");
            return StatusCode(500, "Internal server error");
        }
    }
}
