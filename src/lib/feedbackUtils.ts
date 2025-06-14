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
   } else if (keywords.includes('conflict') || keywords.includes('argument') || keywords.includes('clash') || keywords.includes('tension') || keywords.includes('disagree')) {
    return "Workplace conflict is tough. Try to stay calm and focus on shared goals. Clear communication and mediation can often ease tension.";

  } else if (keywords.includes('ignored') || keywords.includes('not heard') || keywords.includes('excluded') || keywords.includes('left out') || keywords.includes('invisible')) {
    return "Feeling ignored or excluded can be hurtful. Try to express your feelings and ask to be more involved in discussions or decisions.";

  } else if (keywords.includes('unrecognized') || keywords.includes('no credit') || keywords.includes('not appreciated') || keywords.includes('taken for granted')) {
    return "Not feeling appreciated can impact your motivation. Sometimes a direct conversation about your contributions can help clarify your value.";

  } else if (keywords.includes('bad boss') || keywords.includes('poor leadership') || keywords.includes('no direction') || keywords.includes('unavailable manager')) {
    return "Poor leadership can be frustrating. Try seeking clarity through regular check-ins or mentorship to help set clearer expectations.";

  } else {
    return "Thank you for sharing. Remember that workplace conflicts are often opportunities for growth and better understanding. Consider approaching this situation with curiosity rather than frustration.";
  }
}
