namespace DegreeTracker.Application.DTOs;

public record SubjectDto(
    int Id,
    string Name,
    int Semester,
    string Status,
    bool IsEligible
);

public record SubjectDetailDto(
    int Id,
    string Name,
    int Semester,
    string Status,
    bool IsEligible,
    List<string> MissingRequirements
);

public record DegreeDto(
    int Id,
    string Name,
    int TotalSubjects,
    int ApprovedSubjects
);

public record UpdateSubjectStatusRequest(
    string Status
);

public record RelatedSubjectDto(
    string Name,
    int Semester
);

public record ImpactDetailDto(
    int Count,
    List<RelatedSubjectDto> Subjects
);

public record StrategicSubjectDto(
    int SubjectId,
    string SubjectName,
    int Semester,
    string RequiredAction,
    ImpactDetailDto DirectUnlocks,
    ImpactDetailDto FutureDependents
);
