// Helper to parse and format requirement messages from the backend
export interface ParsedRequirement {
  type: 'partial' | 'total' | 'count' | 'unknown';
  subjectName?: string;
  message: string;
  emphasis: string; // The key part to highlight
}

export function parseRequirement(requirement: string): ParsedRequirement {
  const lowerReq = requirement.toLowerCase();

  // Pattern: "Falta cursar: MateriaNombre"
  if (lowerReq.includes('falta cursar:')) {
    const match = requirement.match(/falta cursar:\s*(.+)/i);
    if (match) {
      return {
        type: 'partial',
        subjectName: match[1].trim(),
        message: requirement,
        emphasis: 'cursada',
      };
    }
  }

  // Pattern: "Falta aprobar: MateriaNombre (no cursada)"
  // Pattern: "Falta aprobar: MateriaNombre (cursada pero no aprobada)"
  if (lowerReq.includes('falta aprobar:')) {
    const match = requirement.match(/falta aprobar:\s*([^(]+)/i);
    if (match) {
      const subjectName = match[1].trim();
      const isCursed = lowerReq.includes('cursada pero no aprobada');
      return {
        type: 'total',
        subjectName,
        message: requirement,
        emphasis: isCursed ? 'aprobación final' : 'aprobada',
      };
    }
  }

  // Pattern: "Faltan X materias aprobadas (tienes Y/Z)"
  if (lowerReq.includes('materias aprobadas')) {
    const match = requirement.match(/faltan\s+(\d+)\s+materias/i);
    if (match) {
      return {
        type: 'count',
        message: requirement,
        emphasis: `${match[1]} materias más`,
      };
    }
  }

  // Default
  return {
    type: 'unknown',
    message: requirement,
    emphasis: requirement,
  };
}

export function getRequirementIcon(type: ParsedRequirement['type']): string {
  switch (type) {
    case 'partial':
      return 'P';
    case 'total':
      return 'T';
    case 'count':
      return '#';
    default:
      return '!';
  }
}

export function getRequirementCssClass(type: ParsedRequirement['type']): string {
  switch (type) {
    case 'partial':
      return 'req-partial';
    case 'total':
      return 'req-total';
    case 'count':
      return 'req-count';
    default:
      return 'req-unknown';
  }
}
