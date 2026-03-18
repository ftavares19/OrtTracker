using DegreeTracker.Application.Services;
using DegreeTracker.Domain.Services;
using DegreeTracker.Infrastructure.Persistence;
using DegreeTracker.Application.DTOs;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddDbContext<DegreeTrackerDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=degreetracker.db"));

builder.Services.AddScoped<DbContext>(sp => sp.GetRequiredService<DegreeTrackerDbContext>());
builder.Services.AddScoped<ISubjectEligibilityService, SubjectEligibilityService>();
builder.Services.AddScoped<IStrategicSubjectAnalysisService, StrategicSubjectAnalysisService>();
builder.Services.AddScoped<IDegreeService, DegreeService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<DegreeTrackerDbContext>();
    var curriculumPath = Path.Combine(AppContext.BaseDirectory, "curriculum.json");
    DbInitializer.Initialize(context, curriculumPath);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseHttpsRedirection();

app.MapGet("/api/degrees/{id}", async (int id, IDegreeService service) =>
{
    var degree = await service.GetDegreeAsync(id);
    return degree is not null ? Results.Ok(degree) : Results.NotFound();
})
.WithName("GetDegree")
.WithOpenApi();

app.MapGet("/api/degrees/{degreeId}/subjects", async (int degreeId, IDegreeService service) =>
{
    var subjects = await service.GetSubjectsAsync(degreeId);
    return Results.Ok(subjects);
})
.WithName("GetSubjects")
.WithOpenApi();

app.MapGet("/api/subjects/{id}", async (int id, IDegreeService service) =>
{
    var subject = await service.GetSubjectDetailAsync(id);
    return subject is not null ? Results.Ok(subject) : Results.NotFound();
})
.WithName("GetSubjectDetail")
.WithOpenApi();

app.MapGet("/api/degrees/{degreeId}/subjects/eligible", async (int degreeId, IDegreeService service) =>
{
    var subjects = await service.GetEligibleSubjectsAsync(degreeId);
    return Results.Ok(subjects);
})
.WithName("GetEligibleSubjects")
.WithOpenApi();

app.MapGet("/api/degrees/{degreeId}/subjects/strategic", async (int degreeId, IDegreeService service) =>
{
    var strategicSubjects = await service.GetStrategicSubjectsAsync(degreeId);
    return Results.Ok(strategicSubjects);
})
.WithName("GetStrategicSubjects")
.WithOpenApi();

app.MapPut("/api/subjects/{id}/status", async (int id, UpdateSubjectStatusRequest request, IDegreeService service) =>
{
    var result = await service.UpdateSubjectStatusAsync(id, request.Status);
    return result ? Results.Ok() : Results.BadRequest("Invalid status or subject not found");
})
.WithName("UpdateSubjectStatus")
.WithOpenApi();

app.Run();
