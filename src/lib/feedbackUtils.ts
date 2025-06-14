export function getFeedbackForVent(text: string): string {
  const keywords = text.toLowerCase();

  if (keywords.includes('workload') || keywords.includes('too much') || keywords.includes('overwhelmed')) {
    return "It sounds like you're feeling overwhelmed with your workload. Consider having a conversation about priorities and realistic timelines. Maybe suggest a weekly check-in to align on what's most important.";
  } else if (keywords.includes('micromanage') || keywords.includes('control') || keywords.includes('trust')) {
    return "Feeling micromanaged can be frustrating. Try demonstrating your reliability through consistent updates and proactive communication. This might help build the trust needed for more autonomy.";
  } else if (keywords.includes('unfair') || keywords.includes('bias') || keywords.includes('favorite')) {
    return "Workplace fairness is important for everyone. Consider documenting specific examples and having a calm, professional conversation about your observations. Focus on the impact rather than intentions.";
  } else if (keywords.includes('communication') || keywords.includes('unclear') || keywords.includes('confusing')) {
    return "Clear communication is key to a good working relationship. Try asking specific questions and summarizing what you understand to ensure you're both on the same page.";
  } else {
    return "Thank you for sharing. Remember that workplace conflicts are often opportunities for growth and better understanding. Consider approaching this situation with curiosity rather than frustration.";
  }
}

export interface BossReport {
  rephrased_vent_statements: string;
  suggestions_for_boss: string;
}

export const generateBossReport = (text: string): BossReport => {
  const lowerText = text.toLowerCase();
  let report: BossReport = {
    rephrased_vent_statements: "The employee shared some general concerns about their experience at work.",
    suggestions_for_boss: "Consider having an open conversation with your team member to understand their perspective better. Regular check-ins can help identify and address concerns proactively. Ensure that feedback channels are open and that employees feel heard."
  };

  // Workload
  if (lowerText.includes("workload") || lowerText.includes("too much") || lowerText.includes("overwhelmed") || lowerText.includes("burnt out") || lowerText.includes("no time")) {
    report = {
      rephrased_vent_statements: "The employee has expressed concerns about their current workload, mentioning feelings of being overwhelmed or short on time. They may be struggling to manage their tasks effectively or feel that the amount of work is unsustainable.",
      suggestions_for_boss: "Review the current task distribution and deadlines for this employee. Discuss their capacity and priorities. Explore opportunities for delegation, reprioritization, or providing additional resources. Ensure expectations are realistic and achievable."
    };
  }
  // Micromanagement - using else if to prioritize, could be combined if multiple themes are desired in one report
  else if (lowerText.includes("micromanage") || lowerText.includes("control") || lowerText.includes("trust") || lowerText.includes("no autonomy")) {
    report = {
      rephrased_vent_statements: "The employee feels a lack of trust or autonomy in their role. They may perceive current management practices as overly controlling or indicative of micromanagement, which can impact their sense of ownership and motivation.",
      suggestions_for_boss: "Focus on building trust by providing clear objectives and then allowing space for the employee to manage their own work. Offer support and guidance rather than constant oversight. Clearly define responsibilities and empower them to make decisions within their scope."
    };
  }
  // Unfairness/Bias
  else if (lowerText.includes("unfair") || lowerText.includes("bias") || lowerText.includes("favorite") || lowerText.includes("not equal")) {
    report = {
      rephrased_vent_statements: "The employee has raised concerns about fairness in the workplace. This could relate to task assignments, recognition, opportunities, or treatment compared to others. They may feel that there is an element of bias or favoritism affecting them.",
      suggestions_for_boss: "Ensure transparency in decision-making processes, especially regarding opportunities and task distribution. Objectively assess situations for any potential bias and address them directly. Foster an environment of equal opportunity and consistent treatment for all team members."
    };
  }
  // Communication
  else if (lowerText.includes("communication") || lowerText.includes("unclear") || lowerText.includes("confusing") || lowerText.includes("no information")) {
    report = {
      rephrased_vent_statements: "The employee is experiencing challenges related to communication. They may find instructions unclear, information lacking, or overall communication confusing, which can hinder their ability to perform their tasks effectively.",
      suggestions_for_boss: "Strive for clarity and consistency in all communications. Ensure that important information is disseminated effectively and that employees have channels to ask questions and seek clarification. Regular team meetings and summaries can help improve understanding."
    };
  }

  return report;
};
