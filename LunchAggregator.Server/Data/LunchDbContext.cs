using Microsoft.EntityFrameworkCore;
using LunchAggregator.API.Models;

namespace LunchAggregator.API.Data;

public class LunchDbContext : DbContext
{
    public LunchDbContext(DbContextOptions<LunchDbContext> options) : base(options)
    {
    }

    public DbSet<Restaurant> Restaurants { get; set; }
    public DbSet<Dish> Dishes { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderSession> OrderSessions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Restaurant configuration
        modelBuilder.Entity<Restaurant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Cuisine).HasMaxLength(50);
        });

        // Dish configuration
        modelBuilder.Entity<Dish>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Price).HasColumnType("decimal(10,2)");
            
            entity.HasOne(d => d.Restaurant)
                .WithMany(r => r.Dishes)
                .HasForeignKey(d => d.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // OrderSession configuration
        modelBuilder.Entity<OrderSession>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedBy).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ParticipantNames).HasMaxLength(2000);
            entity.Property(e => e.IsActive).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            
            entity.HasOne(s => s.Restaurant)
                .WithMany()
                .HasForeignKey(s => s.RestaurantId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Order configuration
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PersonName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.OrderedAt).IsRequired();
            
            entity.HasOne(o => o.Dish)
                .WithMany()
                .HasForeignKey(o => o.DishId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(o => o.Session)
                .WithMany(s => s.Orders)
                .HasForeignKey(o => o.SessionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Restaurants
        modelBuilder.Entity<Restaurant>().HasData(
            new Restaurant { Id = 1, Name = "Pizzeria Napoli", Cuisine = "Włoska", ImageUrl = "🍕" },
            new Restaurant { Id = 2, Name = "Sushi Master", Cuisine = "Japońska", ImageUrl = "🍣" },
            new Restaurant { Id = 3, Name = "Burger Street", Cuisine = "Amerykańska", ImageUrl = "🍔" },
            new Restaurant { Id = 4, Name = "Green Garden", Cuisine = "Wegańska", ImageUrl = "🥗" }
        );

        // Dishes - Pizzeria Napoli
        modelBuilder.Entity<Dish>().HasData(
            new Dish { Id = 1, Name = "Pizza Margherita", Description = "Sos pomidorowy, mozzarella, bazylia", Price = 28.00m, RestaurantId = 1 },
            new Dish { Id = 2, Name = "Pizza Pepperoni", Description = "Sos pomidorowy, mozzarella, pepperoni", Price = 32.00m, RestaurantId = 1 },
            new Dish { Id = 3, Name = "Pizza Quattro Formaggi", Description = "Cztery rodzaje sera", Price = 35.00m, RestaurantId = 1 },
            new Dish { Id = 4, Name = "Spaghetti Carbonara", Description = "Makaron, boczek, jajko, parmezan", Price = 30.00m, RestaurantId = 1 },
            new Dish { Id = 5, Name = "Lasagne", Description = "Tradycyjna lasagne bolognese", Price = 33.00m, RestaurantId = 1 }
        );

        // Dishes - Sushi Master
        modelBuilder.Entity<Dish>().HasData(
            new Dish { Id = 6, Name = "Sushi Set California", Description = "8 kawałków California Roll", Price = 35.00m, RestaurantId = 2 },
            new Dish { Id = 7, Name = "Sushi Set Sake", Description = "10 kawałków z łososiem", Price = 42.00m, RestaurantId = 2 },
            new Dish { Id = 8, Name = "Ramen Tonkotsu", Description = "Japońska zupa ramen z wieprzowiną", Price = 38.00m, RestaurantId = 2 },
            new Dish { Id = 9, Name = "Tempura Ebi", Description = "Smażone krewetki w cieście", Price = 28.00m, RestaurantId = 2 },
            new Dish { Id = 10, Name = "Combo Sushi & Sashimi", Description = "Mix sushi i sashimi", Price = 55.00m, RestaurantId = 2 }
        );

        // Dishes - Burger Street
        modelBuilder.Entity<Dish>().HasData(
            new Dish { Id = 11, Name = "Classic Burger", Description = "Wołowina, sałata, pomidor, ogórek", Price = 25.00m, RestaurantId = 3 },
            new Dish { Id = 12, Name = "Cheeseburger Deluxe", Description = "Podwójne mięso, cheddar, bekon", Price = 32.00m, RestaurantId = 3 },
            new Dish { Id = 13, Name = "Chicken Burger", Description = "Panierowany kurczak, coleslaw", Price = 27.00m, RestaurantId = 3 },
            new Dish { Id = 14, Name = "Frytki Premium", Description = "Duża porcja frytek z sosem", Price = 12.00m, RestaurantId = 3 },
            new Dish { Id = 15, Name = "Nuggetsy (10 szt)", Description = "Chrupiące nuggetsy z kurczaka", Price = 18.00m, RestaurantId = 3 }
        );

        // Dishes - Green Garden
        modelBuilder.Entity<Dish>().HasData(
            new Dish { Id = 16, Name = "Buddha Bowl", Description = "Quinoa, awokado, hummus, warzywa", Price = 30.00m, RestaurantId = 4 },
            new Dish { Id = 17, Name = "Wegańskie Curry", Description = "Curry z mleczkiem kokosowym i warzywami", Price = 28.00m, RestaurantId = 4 },
            new Dish { Id = 18, Name = "Sałatka Cezar Vegan", Description = "Wegańska wersja klasyka", Price = 26.00m, RestaurantId = 4 },
            new Dish { Id = 19, Name = "Wrap z Falafel", Description = "Tortilla, falafel, warzywa, tahini", Price = 24.00m, RestaurantId = 4 },
            new Dish { Id = 20, Name = "Smoothie Bowl", Description = "Acai, owoce, granola", Price = 22.00m, RestaurantId = 4 }
        );
    }
}
