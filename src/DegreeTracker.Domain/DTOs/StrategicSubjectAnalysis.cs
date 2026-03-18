namespace DegreeTracker.Domain.DTOs;

public enum RequiredAction
{
    Complete,
    Approve
}

public class RelatedSubject
{
    public string Name { get; set; } = string.Empty;
    public int Semester { get; set; }
}

public class ImpactDetail
{
    public int Count { get; set; }
    public List<RelatedSubject> Subjects { get; set; } = new();
}

public class StrategicSubjectAnalysis
{
    public int SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public int Semester { get; set; }
    public RequiredAction RequiredAction { get; set; }
    public ImpactDetail DirectUnlocks { get; set; } = new();
    public ImpactDetail FutureDependents { get; set; } = new();
}
