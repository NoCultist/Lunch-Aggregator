namespace LunchAggregator.API.Models;

public class Dish
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int RestaurantId { get; set; }
    
    // Navigation property
    public Restaurant Restaurant { get; set; } = null!;
}
