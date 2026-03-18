using Microsoft.EntityFrameworkCore;
using DegreeTracker.Domain.Entities;

namespace DegreeTracker.Infrastructure.Persistence;

public class DegreeTrackerDbContext : DbContext
{
    public DegreeTrackerDbContext(DbContextOptions<DegreeTrackerDbContext> options) 
        : base(options)
    {
    }

    public DbSet<Degree> Degrees { get; set; }
    public DbSet<Subject> Subjects { get; set; }
    public DbSet<Requirement> Requirements { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Degree>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
        });

        modelBuilder.Entity<Subject>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Semester).IsRequired();
            entity.Property(e => e.Status).IsRequired()
                .HasConversion<string>();

            entity.HasOne(e => e.Degree)
                .WithMany(d => d.Subjects)
                .HasForeignKey(e => e.DegreeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Requirement>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.HasDiscriminator<string>("RequirementType")
                .HasValue<SubjectRequirement>("Subject")
                .HasValue<ApprovedSubjectsCountRequirement>("ApprovedCount");

            entity.HasOne(e => e.Subject)
                .WithMany(s => s.Requirements)
                .HasForeignKey(e => e.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SubjectRequirement>(entity =>
        {
            entity.Property(e => e.RequiredSubjectName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.RequiredCreditType).IsRequired()
                .HasConversion<string>();
        });

        modelBuilder.Entity<ApprovedSubjectsCountRequirement>(entity =>
        {
            entity.Property(e => e.RequiredCount).IsRequired();
        });
    }
}
