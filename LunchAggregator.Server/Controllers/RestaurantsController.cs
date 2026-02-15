using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LunchAggregator.API.Data;
using LunchAggregator.API.DTOs;

namespace LunchAggregator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RestaurantsController : ControllerBase
{
    private readonly LunchDbContext _context;
    private readonly ILogger<RestaurantsController> _logger;

    public RestaurantsController(LunchDbContext context, ILogger<RestaurantsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Pobiera listę wszystkich restauracji
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RestaurantDto>>> GetRestaurants()
    {
        try
        {
            var restaurants = await _context.Restaurants
                .Select(r => new RestaurantDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Cuisine = r.Cuisine,
                    ImageUrl = r.ImageUrl
                })
                .ToListAsync();

            return Ok(restaurants);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching restaurants");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Pobiera menu (dania) dla wybranej restauracji
    /// </summary>
    [HttpGet("{id}/menu")]
    public async Task<ActionResult<IEnumerable<DishDto>>> GetRestaurantMenu(int id)
    {
        try
        {
            var restaurant = await _context.Restaurants.FindAsync(id);
            if (restaurant == null)
            {
                return NotFound($"Restaurant with ID {id} not found");
            }

            var dishes = await _context.Dishes
                .Where(d => d.RestaurantId == id)
                .Select(d => new DishDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Description = d.Description,
                    Price = d.Price,
                    RestaurantId = d.RestaurantId,
                    RestaurantName = d.Restaurant.Name
                })
                .ToListAsync();

            return Ok(dishes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching menu for restaurant {RestaurantId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}
