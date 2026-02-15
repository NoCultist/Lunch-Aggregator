namespace LunchAggregator.API.Models;

public class Order
{
    public int Id { get; set; }
    public string PersonName { get; set; } = string.Empty;
    // Client-generated id used to uniquely identify the user who placed the order
    public string PersonClientId { get; set; } = string.Empty;
    public int DishId { get; set; }
    public int SessionId { get; set; }
    public DateTime OrderedAt { get; set; } = DateTime.UtcNow;
    public bool HasJoinedSession { get; set; } = true; // Czy user dołączył do sesji
    
    // Navigation properties
    public Dish Dish { get; set; } = null!;
    public OrderSession Session { get; set; } = null!;
}
