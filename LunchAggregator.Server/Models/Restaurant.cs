namespace LunchAggregator.API.Models;

public class Restaurant
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Cuisine { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    
    // Navigation property
    public ICollection<Dish> Dishes { get; set; } = new List<Dish>();
}
