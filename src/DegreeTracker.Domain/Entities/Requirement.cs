namespace DegreeTracker.Domain.Entities;

public enum CreditType
{
    Partial,
    Total
}

public abstract class Requirement
{
    public int Id { get; set; }
    public int SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
    
    public abstract bool IsSatisfied(IEnumerable<Subject> allSubjects);
    public abstract string GetDescription();
    public abstract string GetMissingDescription(IEnumerable<Subject> allSubjects);
}

public class SubjectRequirement : Requirement
{
    public string RequiredSubjectName { get; set; } = string.Empty;
    public CreditType RequiredCreditType { get; set; } = CreditType.Total;
    
    public override bool IsSatisfied(IEnumerable<Subject> allSubjects)
    {
        var requiredSubject = allSubjects.FirstOrDefault(s => s.Name == RequiredSubjectName);
        if (requiredSubject == null) return false;

        return RequiredCreditType switch
        {
            CreditType.Partial => requiredSubject.Status >= SubjectStatus.PartiallyApproved,
            CreditType.Total => requiredSubject.Status == SubjectStatus.Approved,
            _ => false
        };
    }
    
    public override string GetDescription()
    {
        var creditTypeText = RequiredCreditType == CreditType.Partial ? "cursada" : "aprobada";
        return $"Requiere {RequiredSubjectName} ({creditTypeText})";
    }

    public override string GetMissingDescription(IEnumerable<Subject> allSubjects)
    {
        var requiredSubject = allSubjects.FirstOrDefault(s => s.Name == RequiredSubjectName);
        if (requiredSubject == null)
            return $"Materia '{RequiredSubjectName}' no encontrada en el plan";

        return RequiredCreditType switch
        {
            CreditType.Partial when requiredSubject.Status == SubjectStatus.NotTaken 
                => $"Falta cursar: {RequiredSubjectName}",
            CreditType.Total when requiredSubject.Status == SubjectStatus.NotTaken 
                => $"Falta aprobar: {RequiredSubjectName} (no cursada)",
            CreditType.Total when requiredSubject.Status == SubjectStatus.PartiallyApproved 
                => $"Falta aprobar: {RequiredSubjectName} (cursada pero no aprobada)",
            _ => string.Empty
        };
    }
}

public class ApprovedSubjectsCountRequirement : Requirement
{
    public int RequiredCount { get; set; }
    
    public override bool IsSatisfied(IEnumerable<Subject> allSubjects)
    {
        return allSubjects.Count(s => s.IsApproved) >= RequiredCount;
    }
    
    public override string GetDescription()
    {
        return $"Requiere al menos {RequiredCount} materias aprobadas";
    }

    public override string GetMissingDescription(IEnumerable<Subject> allSubjects)
    {
        var currentCount = allSubjects.Count(s => s.IsApproved);
        var missing = RequiredCount - currentCount;
        return $"Faltan {missing} materias aprobadas (tienes {currentCount}/{RequiredCount})";
    }
}
