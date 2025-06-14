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
