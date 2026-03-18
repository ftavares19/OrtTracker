using DegreeTracker.Domain.Entities;
using DegreeTracker.Infrastructure.Models;
using System.Text.Json;

namespace DegreeTracker.Infrastructure.Persistence;

public static class DbInitializer
{
    public static void Initialize(DegreeTrackerDbContext context, string curriculumJsonPath)
    {
        context.Database.EnsureCreated();

        if (context.Degrees.Any())
            return;

        var jsonContent = File.ReadAllText(curriculumJsonPath);
        var curriculumData = JsonSerializer.Deserialize<CurriculumData>(jsonContent);

        if (curriculumData == null)
            throw new InvalidOperationException("Failed to load curriculum data from JSON");

        var degree = new Degree
        {
            Name = curriculumData.DegreeName
        };

        context.Degrees.Add(degree);
        context.SaveChanges();

        var subjects = new Dictionary<string, Subject>();
        
        foreach (var subjectData in curriculumData.Subjects)
        {
            var subject = new Subject
            {
                Name = subjectData.Name,
                Semester = subjectData.Semester,
                Status = SubjectStatus.NotTaken,
                DegreeId = degree.Id
            };

            subjects[subjectData.Name] = subject;
            context.Subjects.Add(subject);
        }
        
        context.SaveChanges();

        foreach (var subjectData in curriculumData.Subjects)
        {
            var subject = subjects[subjectData.Name];
            
            foreach (var reqData in subjectData.Requirements)
            {
                Requirement requirement = reqData.Type.ToLower() switch
                {
                    "subject" => new SubjectRequirement
                    {
                        SubjectId = subject.Id,
                        RequiredSubjectName = reqData.SubjectName ?? string.Empty,
                        RequiredCreditType = Enum.Parse<CreditType>(reqData.CreditType ?? "Total", true)
                    },
                    "approvedcount" => new ApprovedSubjectsCountRequirement
                    {
                        SubjectId = subject.Id,
                        RequiredCount = reqData.Count ?? 0
                    },
                    _ => throw new InvalidOperationException($"Unknown requirement type: {reqData.Type}")
                };

                context.Requirements.Add(requirement);
            }
        }

        context.SaveChanges();

        ValidateCurriculum(subjects, curriculumData);
    }

    private static void ValidateCurriculum(Dictionary<string, Subject> subjects, CurriculumData curriculumData)
    {
        foreach (var subjectData in curriculumData.Subjects)
        {
            foreach (var reqData in subjectData.Requirements)
            {
                if (reqData.Type.Equals("subject", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrEmpty(reqData.SubjectName))
                        throw new InvalidOperationException($"Subject requirement for '{subjectData.Name}' missing subjectName");

                    if (!subjects.ContainsKey(reqData.SubjectName))
                        throw new InvalidOperationException($"Subject '{subjectData.Name}' requires '{reqData.SubjectName}' which doesn't exist in curriculum");
                }
            }
        }
    }
}
