using DegreeTracker.Application.DTOs;
using DegreeTracker.Domain.Entities;
using DegreeTracker.Domain.Services;
using Microsoft.EntityFrameworkCore;

namespace DegreeTracker.Application.Services;

public interface IDegreeService
{
    Task<DegreeDto?> GetDegreeAsync(int degreeId);
    Task<IEnumerable<SubjectDto>> GetSubjectsAsync(int degreeId);
    Task<SubjectDetailDto?> GetSubjectDetailAsync(int subjectId);
    Task<IEnumerable<SubjectDto>> GetEligibleSubjectsAsync(int degreeId);
    Task<IEnumerable<StrategicSubjectDto>> GetStrategicSubjectsAsync(int degreeId);
    Task<bool> UpdateSubjectStatusAsync(int subjectId, string status);
}

public class DegreeService : IDegreeService
{
    private readonly DbContext _context;
    private readonly ISubjectEligibilityService _eligibilityService;
    private readonly IStrategicSubjectAnalysisService _strategicAnalysisService;

    public DegreeService(
        DbContext context, 
        ISubjectEligibilityService eligibilityService,
        IStrategicSubjectAnalysisService strategicAnalysisService)
    {
        _context = context;
        _eligibilityService = eligibilityService;
        _strategicAnalysisService = strategicAnalysisService;
    }

    public async Task<DegreeDto?> GetDegreeAsync(int degreeId)
    {
        var degree = await _context.Set<Degree>()
            .Include(d => d.Subjects)
            .FirstOrDefaultAsync(d => d.Id == degreeId);

        if (degree == null)
            return null;

        return new DegreeDto(
            degree.Id,
            degree.Name,
            degree.Subjects.Count,
            degree.Subjects.Count(s => s.IsApproved)
        );
    }

    public async Task<IEnumerable<SubjectDto>> GetSubjectsAsync(int degreeId)
    {
        var subjects = await _context.Set<Subject>()
            .Include(s => s.Requirements)
            .Where(s => s.DegreeId == degreeId)
            .ToListAsync();

        var allSubjects = subjects.ToList();

        return subjects.Select(s => new SubjectDto(
            s.Id,
            s.Name,
            s.Semester,
            s.Status.ToString(),
            _eligibilityService.IsSubjectEligible(s, allSubjects)
        ));
    }

    public async Task<SubjectDetailDto?> GetSubjectDetailAsync(int subjectId)
    {
        var subject = await _context.Set<Subject>()
            .Include(s => s.Requirements)
            .FirstOrDefaultAsync(s => s.Id == subjectId);

        if (subject == null)
            return null;

        var allSubjects = await _context.Set<Subject>()
            .Where(s => s.DegreeId == subject.DegreeId)
            .ToListAsync();

        var missingRequirements = _eligibilityService.GetMissingRequirements(subject, allSubjects).ToList();

        return new SubjectDetailDto(
            subject.Id,
            subject.Name,
            subject.Semester,
            subject.Status.ToString(),
            _eligibilityService.IsSubjectEligible(subject, allSubjects),
            missingRequirements
        );
    }

    public async Task<IEnumerable<SubjectDto>> GetEligibleSubjectsAsync(int degreeId)
    {
        var subjects = await _context.Set<Subject>()
            .Include(s => s.Requirements)
            .Where(s => s.DegreeId == degreeId)
            .ToListAsync();

        var eligibleSubjects = _eligibilityService.GetEligibleSubjects(subjects);

        return eligibleSubjects.Select(s => new SubjectDto(
            s.Id,
            s.Name,
            s.Semester,
            s.Status.ToString(),
            true
        ));
    }

    public async Task<IEnumerable<StrategicSubjectDto>> GetStrategicSubjectsAsync(int degreeId)
    {
        var subjects = await _context.Set<Subject>()
            .Include(s => s.Requirements)
            .Where(s => s.DegreeId == degreeId)
            .ToListAsync();

        var analyses = _strategicAnalysisService.AnalyzeStrategicSubjects(subjects);

        return analyses.Select(a => new StrategicSubjectDto(
            a.SubjectId,
            a.SubjectName,
            a.Semester,
            a.RequiredAction.ToString(),
            new ImpactDetailDto(
                a.DirectUnlocks.Count, 
                a.DirectUnlocks.Subjects.Select(s => new RelatedSubjectDto(s.Name, s.Semester)).ToList()
            ),
            new ImpactDetailDto(
                a.FutureDependents.Count,
                a.FutureDependents.Subjects.Select(s => new RelatedSubjectDto(s.Name, s.Semester)).ToList()
            )
        ));
    }

    public async Task<bool> UpdateSubjectStatusAsync(int subjectId, string status)
    {
        var subject = await _context.Set<Subject>().FindAsync(subjectId);
        
        if (subject == null)
            return false;

        if (Enum.TryParse<SubjectStatus>(status, true, out var subjectStatus))
        {
            subject.Status = subjectStatus;
            await _context.SaveChangesAsync();
            return true;
        }

        return false;
    }
}
