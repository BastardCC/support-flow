export const statusLabels: Record<string, string> = {
  received: "Reçu",
  analyzing: "Analyse…",
  analyzed: "Analysé",
  replied: "Répondu",
  closed: "Clôturé",
};

export const urgencyLabels = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
  critical: "Critique",
} as const;

export const categoryLabels = {
  billing: "Facturation",
  technical: "Technique",
  complaint: "Réclamation",
  information: "Information",
  other: "Autre",
} as const;

export const sentimentLabels = {
  positive: "Positif",
  neutral: "Neutre",
  negative: "Négatif",
} as const;
