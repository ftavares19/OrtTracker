using DegreeTracker.Domain.Entities;
using DegreeTracker.Domain.DTOs;

namespace DegreeTracker.Domain.Services;

public interface IStrategicSubjectAnalysisService
{
    IEnumerable<StrategicSubjectAnalysis> AnalyzeStrategicSubjects(IEnumerable<Subject> allSubjects);
}

public class StrategicSubjectAnalysisService : IStrategicSubjectAnalysisService
{
    private readonly ISubjectEligibilityService _eligibilityService;

    public StrategicSubjectAnalysisService(ISubjectEligibilityService eligibilityService)
    {
        _eligibilityService = eligibilityService;
    }

    public IEnumerable<StrategicSubjectAnalysis> AnalyzeStrategicSubjects(IEnumerable<Subject> allSubjects)
    {
        var subjectsList = allSubjects.ToList();
        var eligibleSubjects = _eligibilityService.GetEligibleSubjects(subjectsList).ToList();
        var blockedSubjects = subjectsList.Where(s => !s.IsApproved && !eligibleSubjects.Contains(s)).ToList();

        var analyses = new List<StrategicSubjectAnalysis>();

        foreach (var eligible in eligibleSubjects)
        {
            var analysis = AnalyzeSubjectImpact(eligible, blockedSubjects, subjectsList);
            
            if (analysis.DirectUnlocks.Count > 0 || analysis.FutureDependents.Count > 0)
            {
                analyses.Add(analysis);
            }
        }

        return analyses
            .OrderByDescending(a => a.DirectUnlocks.Count)
            .ThenByDescending(a => a.FutureDependents.Count)
            .ToList();
    }

    private StrategicSubjectAnalysis AnalyzeSubjectImpact(
        Subject eligibleSubject, 
        List<Subject> blockedSubjects, 
        List<Subject> allSubjects)
    {
        var directUnlocks = new List<Subject>();
        var futureDependents = new List<Subject>();
        var mostRestrictiveAction = RequiredAction.Complete;

        foreach (var blocked in blockedSubjects)
        {
            var isDirectPrerequisite = IsDirectPrerequisite(eligibleSubject, blocked);
            
            if (!isDirectPrerequisite)
                continue;

            var wouldUnlock = WouldUnlockSubject(eligibleSubject, blocked, allSubjects, out var requiredAction);
            
            if (wouldUnlock)
            {
                directUnlocks.Add(blocked);
                
                if (requiredAction == RequiredAction.Approve)
                {
                    mostRestrictiveAction = RequiredAction.Approve;
                }
            }
            else
            {
                futureDependents.Add(blocked);
            }
        }

        return new StrategicSubjectAnalysis
        {
            SubjectId = eligibleSubject.Id,
            SubjectName = eligibleSubject.Name,
            Semester = eligibleSubject.Semester,
            RequiredAction = mostRestrictiveAction,
            DirectUnlocks = new ImpactDetail
            {
                Count = directUnlocks.Count,
                Subjects = directUnlocks
                    .OrderBy(s => s.Name)
                    .Select(s => new RelatedSubject { Name = s.Name, Semester = s.Semester })
                    .ToList()
            },
            FutureDependents = new ImpactDetail
            {
                Count = futureDependents.Count,
                Subjects = futureDependents
                    .OrderBy(s => s.Name)
                    .Select(s => new RelatedSubject { Name = s.Name, Semester = s.Semester })
                    .ToList()
            }
        };
    }

    private bool IsDirectPrerequisite(Subject eligibleSubject, Subject targetSubject)
    {
        return targetSubject.Requirements
            .OfType<SubjectRequirement>()
            .Any(r => r.RequiredSubjectName == eligibleSubject.Name);
    }

    private bool WouldUnlockSubject(
        Subject eligibleSubject, 
        Subject blockedSubject, 
        List<Subject> allSubjects,
        out RequiredAction requiredAction)
    {
        requiredAction = RequiredAction.Complete;

        var subjectRequirements = blockedSubject.Requirements
            .OfType<SubjectRequirement>()
            .Where(r => r.RequiredSubjectName == eligibleSubject.Name)
            .ToList();

        if (!subjectRequirements.Any())
        {
            return false;
        }

        var simulatedSubjects = allSubjects.Select(s => 
        {
            if (s.Id == eligibleSubject.Id)
            {
                var simulated = new Subject
                {
                    Id = s.Id,
                    Name = s.Name,
                    Semester = s.Semester,
                    Status = SubjectStatus.PartiallyApproved,
                    DegreeId = s.DegreeId,
                    Requirements = s.Requirements
                };
                return simulated;
            }
            return s;
        }).ToList();

        var wouldUnlockWithPartial = blockedSubject.Requirements.All(req => req.IsSatisfied(simulatedSubjects));

        if (wouldUnlockWithPartial)
        {
            requiredAction = RequiredAction.Complete;
            return true;
        }

        simulatedSubjects = allSubjects.Select(s => 
        {
            if (s.Id == eligibleSubject.Id)
            {
                var simulated = new Subject
                {
                    Id = s.Id,
                    Name = s.Name,
                    Semester = s.Semester,
                    Status = SubjectStatus.Approved,
                    DegreeId = s.DegreeId,
                    Requirements = s.Requirements
                };
                return simulated;
            }
            return s;
        }).ToList();

        var wouldUnlockWithTotal = blockedSubject.Requirements.All(req => req.IsSatisfied(simulatedSubjects));

        if (wouldUnlockWithTotal)
        {
            requiredAction = RequiredAction.Approve;
            return true;
        }

        return false;
    }
}
