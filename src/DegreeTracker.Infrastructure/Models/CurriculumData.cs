using System.Text.Json.Serialization;

namespace DegreeTracker.Infrastructure.Models;

public class CurriculumData
{
    [JsonPropertyName("degreeName")]
    public string DegreeName { get; set; } = string.Empty;
    
    [JsonPropertyName("subjects")]
    public List<SubjectData> Subjects { get; set; } = new();
}

public class SubjectData
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("semester")]
    public int Semester { get; set; }
    
    [JsonPropertyName("requirements")]
    public List<RequirementData> Requirements { get; set; } = new();
}

public class RequirementData
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;
    
    [JsonPropertyName("subjectName")]
    public string? SubjectName { get; set; }
    
    [JsonPropertyName("creditType")]
    public string? CreditType { get; set; }
    
    [JsonPropertyName("count")]
    public int? Count { get; set; }
}
