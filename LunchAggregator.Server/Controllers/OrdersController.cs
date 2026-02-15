using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LunchAggregator.API.Data;
using LunchAggregator.API.DTOs;
using LunchAggregator.API.Models;

namespace LunchAggregator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly LunchDbContext _context;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(LunchDbContext context, ILogger<OrdersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Składa nowe zamówienie
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CreateOrderRequest request)
    {
        try
        {
            // Sprawdzenie czy jest aktywna sesja
            var activeSession = await _context.OrderSessions
                .Include(s => s.Restaurant)
                .Where(s => s.IsActive)
                .FirstOrDefaultAsync();

            if (activeSession == null)
            {
                return BadRequest("No active ordering session. Please wait for the organizer to select a restaurant.");
            }

            // Walidacja
            if (string.IsNullOrWhiteSpace(request.PersonName))
            {
                return BadRequest("Person name is required");
            }

            if (request.PersonName.Length > 100)
            {
                return BadRequest("Person name is too long (max 100 characters)");
            }

            var personName = request.PersonName.Trim();

            // Sprawdzenie czy użytkownik dołączył do sesji
            var participants = string.IsNullOrWhiteSpace(activeSession.ParticipantNames) 
                ? new List<string>() 
                : activeSession.ParticipantNames.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();

            if (!participants.Contains(personName))
            {
                return BadRequest($"You must join the session before ordering. Please join the '{activeSession.Restaurant.Name}' session first.");
            }

            // Sprawdzenie czy danie istnieje i należy do restauracji aktywnej sesji
            var dish = await _context.Dishes
                .Include(d => d.Restaurant)
                .FirstOrDefaultAsync(d => d.Id == request.DishId);

            if (dish == null)
            {
                return NotFound($"Dish with ID {request.DishId} not found");
            }

            if (dish.RestaurantId != activeSession.RestaurantId)
            {
                return BadRequest($"Selected dish is not from the active restaurant ({activeSession.Restaurant.Name})");
            }

            // Tworzenie zamówienia
            var order = new Order
            {
                PersonName = personName,
                PersonClientId = string.IsNullOrWhiteSpace(request.PersonClientId) ? string.Empty : request.PersonClientId.Trim(),
                DishId = request.DishId,
                SessionId = activeSession.Id,
                OrderedAt = DateTime.UtcNow,
                HasJoinedSession = true
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Zwracanie utworzonego zamówienia
            var orderDto = new OrderDto
            {
                Id = order.Id,
                PersonName = order.PersonName,
                PersonClientId = order.PersonClientId,
                DishName = dish.Name,
                DishPrice = dish.Price,
                RestaurantName = dish.Restaurant.Name,
                OrderedAt = order.OrderedAt
            };

            _logger.LogInformation("Order created: {PersonName} ordered {DishName}", order.PersonName, dish.Name);

            return CreatedAtAction(nameof(GetReport), new { }, orderDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating order");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Pobiera raport zbiorczy wszystkich zamówień z aktywnej sesji
    /// </summary>
    [HttpGet("report")]
    public async Task<ActionResult<OrderReportDto>> GetReport()
    {
        try
        {
            var activeSession = await _context.OrderSessions
                .Include(s => s.Restaurant)
                .Where(s => s.IsActive)
                .FirstOrDefaultAsync();

            if (activeSession == null)
            {
                return Ok(new OrderReportDto
                {
                    Session = null,
                    Orders = new List<OrderDto>(),
                    TotalAmount = 0,
                    TotalOrders = 0
                });
            }

            var orders = await _context.Orders
                .Include(o => o.Dish)
                .ThenInclude(d => d.Restaurant)
                .Where(o => o.SessionId == activeSession.Id)
                .OrderBy(o => o.OrderedAt)
                .Select(o => new OrderDto
                {
                    Id = o.Id,
                    PersonName = o.PersonName,
                    PersonClientId = o.PersonClientId,
                    DishName = o.Dish.Name,
                    DishPrice = o.Dish.Price,
                    RestaurantName = o.Dish.Restaurant.Name,
                    OrderedAt = o.OrderedAt
                })
                .ToListAsync();

            var participants = string.IsNullOrWhiteSpace(activeSession.ParticipantNames) 
                ? new List<string>() 
                : activeSession.ParticipantNames.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();

            var sessionDto = new SessionDto
            {
                Id = activeSession.Id,
                RestaurantId = activeSession.RestaurantId,
                RestaurantName = activeSession.Restaurant.Name,
                RestaurantCuisine = activeSession.Restaurant.Cuisine,
                RestaurantImageUrl = activeSession.Restaurant.ImageUrl,
                IsActive = activeSession.IsActive,
                CreatedBy = activeSession.CreatedBy,
                CreatedAt = activeSession.CreatedAt,
                Participants = participants,
                ParticipantCount = participants.Count
            };

            var report = new OrderReportDto
            {
                Session = sessionDto,
                Orders = orders,
                TotalAmount = orders.Sum(o => o.DishPrice),
                TotalOrders = orders.Count
            };

            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating report");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Usuwa wszystkie zamówienia z aktywnej sesji
    /// </summary>
    [HttpDelete("clear")]
    public async Task<ActionResult> ClearOrders()
    {
        try
        {
            var activeSession = await _context.OrderSessions
                .Where(s => s.IsActive)
                .FirstOrDefaultAsync();

            if (activeSession == null)
            {
                return NotFound("No active session found");
            }

            var orders = await _context.Orders
                .Where(o => o.SessionId == activeSession.Id)
                .ToListAsync();
            
            _context.Orders.RemoveRange(orders);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Orders cleared from session {SessionId}", activeSession.Id);

            return Ok(new { message = "All orders cleared successfully", count = orders.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing orders");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Usuwa pojedyncze zamówienie po id (tylko z aktywnej sesji)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteOrder(int id)
    {
        try
        {
            var activeSession = await _context.OrderSessions
                .Where(s => s.IsActive)
                .FirstOrDefaultAsync();

            if (activeSession == null)
            {
                return NotFound("No active session found");
            }

            var order = await _context.Orders.FindAsync(id);
            if (order == null || order.SessionId != activeSession.Id)
            {
                return NotFound("Order not found in active session");
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Order {OrderId} deleted", id);
            return Ok(new { message = "Order deleted", orderId = id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting order");
            return StatusCode(500, "Internal server error");
        }
    }
}
