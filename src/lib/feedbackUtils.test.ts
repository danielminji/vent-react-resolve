import { describe, it, expect } from 'vitest';
import { getFeedbackForVent, generateBossReport, BossReport } from './feedbackUtils';

describe('getFeedbackForVent', () => {
  // Existing tests for getFeedbackForVent remain unchanged
  const workloadFeedback = "It sounds like you're feeling overwhelmed with your workload. Consider having a conversation about priorities and realistic timelines. Maybe suggest a weekly check-in to align on what's most important.";
  const micromanageFeedback = "Feeling micromanaged can be frustrating. Try demonstrating your reliability through consistent updates and proactive communication. This might help build the trust needed for more autonomy.";
  const unfairFeedback = "Workplace fairness is important for everyone. Consider documenting specific examples and having a calm, professional conversation about your observations. Focus on the impact rather than intentions.";
  const communicationFeedback = "Clear communication is key to a good working relationship. Try asking specific questions and summarizing what you understand to ensure you're both on the same page.";
  const defaultFeedback = "Thank you for sharing. Remember that workplace conflicts are often opportunities for growth and better understanding. Consider approaching this situation with curiosity rather than frustration.";

  it('should return workload feedback for "workload" keywords', () => {
    expect(getFeedbackForVent("My workload is too much")).toBe(workloadFeedback);
  });
  it('should return micromanage feedback for "micromanage" keywords', () => {
    expect(getFeedbackForVent("I feel my boss tries to control everything")).toBe(micromanageFeedback);
  });
  it('should return unfair feedback for "unfair" keywords', () => {
    expect(getFeedbackForVent("This treatment is unfair")).toBe(unfairFeedback);
  });
  it('should return communication feedback for "communication" keywords', () => {
    expect(getFeedbackForVent("The instructions were unclear")).toBe(communicationFeedback);
  });
  it('should return default feedback for unrecognized input', () => {
    expect(getFeedbackForVent("I am just having a bad day")).toBe(defaultFeedback);
  });
  it('should be case-insensitive for keywords', () => {
    expect(getFeedbackForVent("my WORKLOAD is high")).toBe(workloadFeedback);
  });
  it('should return default feedback for empty string input', () => {
    expect(getFeedbackForVent("")).toBe(defaultFeedback);
  });
});

describe('generateBossReport (Refactored)', () => {
  const emotionalIntensityNote = "Note: The feedback was expressed with significant emotional intensity, indicating a high level of frustration.";
  const defaultRephrased = "The employee shared some general concerns about their experience at work, or their feedback did not strongly align with common predefined themes.";
  const defaultSuggestion = "Consider having an open conversation with your team member to understand their perspective better, especially if their concerns were not specific or did not fit into common categories. Regular check-ins can help identify and address unique or nuanced concerns proactively. Ensure that feedback channels are open and that employees feel heard, regardless of the topic.";

  const workloadRephrased = "The employee is expressing significant stress related to their workload.";
  const workloadSuggestion = "review this employee's current projects and deadlines";
  const micromanageRephrased = "feels a lack of trust and autonomy";
  const micromanageSuggestion = "Consider ways to demonstrate trust";
  const unfairRephrased = "perception of unfairness or bias";
  const unfairSuggestion = "Reflect on recent team interactions";
  const communicationRephrased = "struggling with a lack of clear communication";
  const communicationSuggestion = "increasing the frequency or clarity of communication";

  it('should handle a realistic workload complaint', () => {
    const report = generateBossReport("I'm completely overwhelmed. Ever since the new project was added, I'm working late every night and my deadlines just feel unrealistic. I feel completely burnt out.");
    expect(report.rephrased_vent_statements).toContain(workloadRephrased);
    expect(report.suggestions_for_boss).toContain(workloadSuggestion);
    expect(report.rephrased_vent_statements).not.toContain(emotionalIntensityNote);
  });

  it('should handle a realistic micromanagement complaint', () => {
    const report = generateBossReport("I feel like you're constantly breathing down my neck. I can't make a single move without being asked for an update. I need some freedom to do my job.");
    expect(report.rephrased_vent_statements).toContain(micromanageRephrased);
    expect(report.suggestions_for_boss).toContain(micromanageSuggestion);
  });

  it('should handle a realistic complaint about unfairness and taking credit', () => {
    let report = generateBossReport("It's so unfair. I worked on that presentation for two weeks, and then you presented it as your own idea. It feels like I'm always blamed for failures, but my successes are taken from me.");
    expect(report.rephrased_vent_statements).toContain(unfairRephrased);
    expect(report.suggestions_for_boss).toContain(unfairSuggestion);
  });

  it('should handle a realistic complaint about communication gaps', () => {
    const report = generateBossReport("I'm completely in the dark about the project restructuring. The instructions I received were so vague, and I have no idea if I'm on the right track because I get no feedback.");
    expect(report.rephrased_vent_statements).toContain(communicationRephrased);
    expect(report.suggestions_for_boss).toContain(communicationSuggestion);
  });

  it('should include vulgarity note when a frustrated user vents about their workload', () => {
    const report = generateBossReport("This fucking workload is absolutely insane! I am so burnt out and I just can't handle these unrealistic deadlines anymore.");
    expect(report.rephrased_vent_statements).toContain(emotionalIntensityNote);
    expect(report.rephrased_vent_statements).toContain(workloadRephrased);
    expect(report.suggestions_for_boss).toContain(workloadSuggestion);
  });

  it('should include vulgarity note and default statements if only vulgarity is present', () => {
    const report = generateBossReport("This is all just a load of shit!");
    expect(report.rephrased_vent_statements).toContain(emotionalIntensityNote);
    expect(report.rephrased_vent_statements).toContain(defaultRephrased); // Because no other theme matched
    expect(report.suggestions_for_boss).toContain(defaultSuggestion);
  });

  it('should handle multiple themes in a realistic, combined vent', () => {
    const report = generateBossReport("I'm so stretched thin with this workload, and on top of that, it feels like I'm being singled out and blamed for things that aren't my fault. It's just really unfair.");
    expect(report.rephrased_vent_statements).toContain(workloadRephrased);
    expect(report.suggestions_for_boss).toContain(workloadSuggestion);
    expect(report.rephrased_vent_statements).toContain(unfairRephrased);
    expect(report.suggestions_for_boss).toContain(unfairSuggestion);
    expect(report.rephrased_vent_statements).not.toContain(emotionalIntensityNote);
  });

  it('should handle multiple themes with vulgarity in a realistic vent', () => {
    const report = generateBossReport("It's bullshit that I have no autonomy and you're constantly breathing down my neck, and the communication about what's expected is so damn unclear.");
    expect(report.rephrased_vent_statements).toContain(emotionalIntensityNote);
    expect(report.rephrased_vent_statements).toContain(micromanageRephrased);
    expect(report.suggestions_for_boss).toContain(micromanageSuggestion);
    expect(report.rephrased_vent_statements).toContain(communicationRephrased);
    expect(report.suggestions_for_boss).toContain(communicationSuggestion);
  });

  it('should return only default statements if no themes and no vulgarity', () => {
    const report = generateBossReport("I think the office plants need more water.");
    expect(report.rephrased_vent_statements).toBe(defaultRephrased); // Exact match for default
    expect(report.suggestions_for_boss).toBe(defaultSuggestion); // Exact match for default
    expect(report.rephrased_vent_statements).not.toContain(emotionalIntensityNote);
  });

  it('should handle empty string input with only default statements', () => {
    const report = generateBossReport("");
    expect(report.rephrased_vent_statements).toBe(defaultRephrased);
    expect(report.suggestions_for_boss).toBe(defaultSuggestion);
    expect(report.rephrased_vent_statements).not.toContain(emotionalIntensityNote);
  });

  it('should be case-insensitive for theme keywords', () => {
    const report = generateBossReport("My WORKLOAD is insane due to UNREALISTIC DEADLINES.");
    expect(report.rephrased_vent_statements).toContain(workloadRephrased);
    expect(report.suggestions_for_boss).toContain(workloadSuggestion);
  });

  it('should be case-insensitive for vulgarity keywords', () => {
    const report = generateBossReport("This is FUCKING ridiculous.");
    expect(report.rephrased_vent_statements).toContain(emotionalIntensityNote);
    // Since no other theme matched, it should also include default rephrased part
    expect(report.rephrased_vent_statements).toContain(defaultRephrased);
    expect(report.suggestions_for_boss).toContain(defaultSuggestion);
  });
});
