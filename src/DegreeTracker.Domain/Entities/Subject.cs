namespace DegreeTracker.Domain.Entities;

public enum SubjectStatus
{
    NotTaken,
    PartiallyApproved,
    Approved
}

public class Subject
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Semester { get; set; }
    public SubjectStatus Status { get; set; } = SubjectStatus.NotTaken;
    public int DegreeId { get; set; }
    
    public Degree Degree { get; set; } = null!;
    public ICollection<Requirement> Requirements { get; set; } = new List<Requirement>();

    public bool IsApproved => Status == SubjectStatus.Approved;
    public bool IsPartiallyApproved => Status == SubjectStatus.PartiallyApproved;
}
