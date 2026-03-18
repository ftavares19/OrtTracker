namespace DegreeTracker.Domain.Entities;

public class Degree
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    
    public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
}
