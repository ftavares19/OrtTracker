using DegreeTracker.Domain.Entities;

namespace DegreeTracker.Domain.Services;

public interface ISubjectEligibilityService
{
    bool IsSubjectEligible(Subject subject, IEnumerable<Subject> allSubjects);
    IEnumerable<Subject> GetEligibleSubjects(IEnumerable<Subject> allSubjects);
    IEnumerable<string> GetMissingRequirements(Subject subject, IEnumerable<Subject> allSubjects);
}

public class SubjectEligibilityService : ISubjectEligibilityService
{
    public bool IsSubjectEligible(Subject subject, IEnumerable<Subject> allSubjects)
    {
        if (subject.IsApproved)
            return false;

        var subjectsList = allSubjects.ToList();
        
        return subject.Requirements.All(req => req.IsSatisfied(subjectsList));
    }

    public IEnumerable<Subject> GetEligibleSubjects(IEnumerable<Subject> allSubjects)
    {
        var subjectsList = allSubjects.ToList();
        return subjectsList.Where(s => IsSubjectEligible(s, subjectsList));
    }

    public IEnumerable<string> GetMissingRequirements(Subject subject, IEnumerable<Subject> allSubjects)
    {
        if (subject.IsApproved)
            return new List<string> { "Materia ya aprobada" };

        var subjectsList = allSubjects.ToList();
        var missingRequirements = new List<string>();

        foreach (var requirement in subject.Requirements)
        {
            if (!requirement.IsSatisfied(subjectsList))
            {
                var missingDesc = requirement.GetMissingDescription(subjectsList);
                if (!string.IsNullOrEmpty(missingDesc))
                    missingRequirements.Add(missingDesc);
            }
        }

        return missingRequirements.Any() ? missingRequirements : new List<string> { "No hay requisitos pendientes" };
    }
}
