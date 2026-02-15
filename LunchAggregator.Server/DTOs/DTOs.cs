namespace LunchAggregator.API.DTOs;

public class RestaurantDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Cuisine { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
}

public class DishDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int RestaurantId { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
}

public class CreateSessionRequest
{
    public int RestaurantId { get; set; }
    public string OrganizerName { get; set; } = string.Empty;
    // Client-generated unique id to identify the organizer client instance (optional)
    public string? OrganizerClientId { get; set; }
}

public class JoinSessionRequest
{
    public int SessionId { get; set; }
    public string PersonName { get; set; } = string.Empty;
}

public class SessionDto
{
    public int Id { get; set; }
    public int RestaurantId { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
    public string RestaurantCuisine { get; set; } = string.Empty;
    public string RestaurantImageUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string CreatedByClientId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<string> Participants { get; set; } = new();
    public int ParticipantCount { get; set; }
}

public class CreateOrderRequest
{
    public string PersonName { get; set; } = string.Empty;
    public int DishId { get; set; }
    // Optional client id of the user placing the order
    public string? PersonClientId { get; set; }
}

public class CloseSessionRequest
{
    // Client id of the requester attempting to close the session
    public string? ClientId { get; set; }
}

public class LeaveSessionRequest
{
    // Person display name (optional)
    public string? PersonName { get; set; }

    // Client id of the requester (optional)
    public string? PersonClientId { get; set; }
}

public class OrderDto
{
    public int Id { get; set; }
    public string PersonName { get; set; } = string.Empty;
    public string DishName { get; set; } = string.Empty;
    public decimal DishPrice { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
    public DateTime OrderedAt { get; set; }
    public string? PersonClientId { get; set; }
}

public class OrderReportDto
{
    public SessionDto? Session { get; set; }
    public List<OrderDto> Orders { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public int TotalOrders { get; set; }
}
