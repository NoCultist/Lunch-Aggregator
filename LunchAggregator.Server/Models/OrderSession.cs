namespace LunchAggregator.API.Models;

public class OrderSession
{
    public int Id { get; set; }
    public int RestaurantId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    public string CreatedBy { get; set; } = string.Empty; // Organizator
    // Unique identifier of the client that created the session. This is used to
    // reliably identify the organizer even if multiple users share the same name.
    public string CreatedByClientId { get; set; } = string.Empty;
    public string ParticipantNames { get; set; } = string.Empty; // Comma-separated list of joined users
    
    // Navigation property
    public Restaurant Restaurant { get; set; } = null!;
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
