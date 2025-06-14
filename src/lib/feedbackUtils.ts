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
      name: "Workload & Burnout",
      keywords: ["workload", "too much", "overwhelmed", "burnt out", "unrealistic deadlines", "stretched thin", "no support"],
      rephrased: "The employee is expressing significant stress related to their workload. They may feel that expectations are unrealistic, deadlines are unmanageable, or that they lack the necessary support, leading to feelings of being overwhelmed and potentially approaching burnout.",
      suggestion: "It might be beneficial to review this employee's current projects and deadlines. Consider asking: 'What does your current workload look like to you?' or 'Is there anything we can deprioritize to ensure you have a manageable workload?' This can open a conversation about realistic expectations and resource allocation."
    },
    {
      name: "Micromanagement & Autonomy",
      keywords: ["micromanage", "control", "trust", "no autonomy", "breathing down my neck", "no freedom"],
      rephrased: "The employee feels a lack of trust and autonomy in their role. They may perceive the current management style as overly controlling, which can stifle their sense of ownership and motivation. They are likely looking for more space to perform their duties independently.",
      suggestion: "Consider ways to demonstrate trust. Could you define the desired outcome of a project and let them determine the process? Try asking: 'I want you to take the lead on this. What do you need from me to be successful?' This can empower them and build confidence."
    },
    {
      name: "Unfair Treatment & Bias",
      keywords: ["unfair", "bias", "favorite", "not equal", "double standard", "singled out", "take credit", "blamed"],
      rephrased: "There is a perception of unfairness or bias in the workplace. The employee may feel that they are being treated differently from their peers, whether in task distribution, recognition, or how mistakes are handled. They might feel that their contributions are undervalued or that they are being unfairly blamed.",
      suggestion: "Reflect on recent team interactions. Is recognition distributed evenly? Are new opportunities offered to everyone? To address this, you could explicitly outline the criteria for new projects or praise specific actions in a team setting, ensuring everyone gets a chance to be seen and acknowledged for their unique contributions."
    },
    {
      name: "Communication Gaps",
      keywords: ["communication", "unclear", "confusing", "no information", "no feedback", "left in the dark", "vague instructions"],
      rephrased: "The employee is struggling with a lack of clear communication. They may find instructions to be vague, feel uninformed about important changes, or desire more constructive feedback on their performance. This uncertainty can make it difficult for them to meet expectations.",
      suggestion: "Consider increasing the frequency or clarity of communication. After giving instructions, you could ask, 'What questions do you have?' or 'Can you quickly summarize the next steps to make sure we're aligned?' Regular, informal check-ins can also provide a space to clarify expectations and provide ongoing feedback."
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
