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
  const rephrased_statements_parts: string[] = [];
  const suggestions_for_boss_parts: string[] = [];
  let themeMatchFound = false;
  let vulgarityNoteAdded = false;

  const vulgarKeywords = ["fuck", "shit", "asshole", "bitch", "bastard"]; // Add more if needed

  // Vulgarity Check
  for (const keyword of vulgarKeywords) {
    if (lowerText.includes(keyword)) {
      rephrased_statements_parts.push("Note: The feedback was expressed with significant emotional intensity, indicating a high level of frustration.");
      vulgarityNoteAdded = true;
      break;
    }
  }

  // Theme Definitions
  const themes = [
    {
      name: "Workload",
      keywords: ["workload", "too much", "overwhelmed", "burnt out", "no time", "unrealistic deadlines", "no support", "stretched too thin"],
      rephrased: "Concerns were expressed about the current workload, with mentions of feeling overwhelmed, pressed for time, or facing unrealistic expectations. This may indicate a struggle to manage tasks effectively or that the volume of work is perceived as unsustainable.",
      suggestion: "Review current task distribution, deadlines, and available support for this team member. Open a discussion about their capacity, priorities, and any perceived unrealistic deadlines. Explore options for delegation, reprioritization, or providing additional resources to ensure expectations are manageable."
    },
    {
      name: "Micromanagement",
      keywords: ["micromanage", "control", "trust", "no autonomy", "breathing down neck", "no freedom", "watch everything"],
      rephrased: "The feedback suggests a feeling of being overly controlled or lacking trust and autonomy. Current management practices might be perceived as micromanagement, potentially impacting their sense of ownership and motivation.",
      suggestion: "Focus on building trust by providing clear objectives and then allowing space for independent work. Offer support and guidance rather than constant oversight. Clearly define responsibilities and empower team members to make decisions within their scope. Ensure they feel they have the freedom to perform their role effectively."
    },
    {
      name: "Unfairness/Bias",
      keywords: ["unfair", "bias", "favorite", "not equal", "different treatment", "scold", "punish", "blame", "take credit", "double standard", "singled out"],
      rephrased: "Concerns about fairness, bias, or unequal treatment have been raised. This could relate to task assignments, recognition, opportunities, disciplinary actions, or how their contributions are acknowledged compared to others.",
      suggestion: "Ensure transparency and consistency in decision-making processes, particularly around opportunities, task distribution, recognition, and disciplinary actions. Objectively assess situations for potential bias. Foster an environment of equal opportunity, fair treatment, and impartial evaluation for all team members. Address any perceptions of favoritism or scapegoating directly."
    },
    {
      name: "Communication",
      keywords: ["communication", "unclear", "confusing", "no information", "not told", "no feedback", "left in the dark", "vague"],
      rephrased: "Challenges related to communication were mentioned. This may include unclear instructions, insufficient information, a lack of feedback, or general confusion, hindering their ability to perform tasks effectively or understand expectations.",
      suggestion: "Strive for clarity, consistency, and timeliness in all communications. Ensure that important information is disseminated effectively and that channels are open for questions and clarifications. Provide regular, constructive feedback. Consider if information is being shared adequately to prevent team members from feeling 'left in the dark'."
    }
  ];

  // Theme Matching
  for (const theme of themes) {
    if (theme.keywords.some(keyword => lowerText.includes(keyword))) {
      rephrased_statements_parts.push(theme.rephrased);
      suggestions_for_boss_parts.push(theme.suggestion);
      themeMatchFound = true;
    }
  }

  // Default Case
  if (!themeMatchFound) {
    // If vulgarity was found but no theme, the vulgarity note is already added.
    // Add default rephrased statement only if no other rephrased statement (even vulgarity note) is present,
    // or if vulgarity was present but we still want a general thematic note.
    // For simplicity now, if vulgarity was the *only* thing, we might want the default thematic note too.
    // If vulgarity was added AND a theme was matched, we don't need this default.
    // If NO theme was matched, then we add default.
    if (rephrased_statements_parts.length === 0 || (vulgarityNoteAdded && rephrased_statements_parts.length === 1) ) {
         rephrased_statements_parts.push("The employee shared some general concerns about their experience at work, or their feedback did not strongly align with common predefined themes.");
    }
    suggestions_for_boss_parts.push("Consider having an open conversation with your team member to understand their perspective better, especially if their concerns were not specific or did not fit into common categories. Regular check-ins can help identify and address unique or nuanced concerns proactively. Ensure that feedback channels are open and that employees feel heard, regardless of the topic.");
  }


  const finalRephrased = rephrased_statements_parts.join("\n\n").trim();
  const finalSuggestions = suggestions_for_boss_parts.join("\n\n").trim();

  return {
    rephrased_vent_statements: finalRephrased,
    suggestions_for_boss: finalSuggestions
  };
};
