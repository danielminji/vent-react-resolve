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

  const workloadRephrased = "Concerns were expressed about the current workload";
  const workloadSuggestion = "Review current task distribution";
  const micromanageRephrased = "feedback suggests a feeling of being overly controlled";
  const micromanageSuggestion = "Focus on building trust";
  const unfairRephrased = "Concerns about fairness, bias, or unequal treatment have been raised";
  const unfairSuggestion = "Ensure transparency and consistency";
  const communicationRephrased = "Challenges related to communication were mentioned";
  const communicationSuggestion = "Strive for clarity, consistency, and timeliness";

  it('should handle workload theme with new keywords', () => {
    const report = generateBossReport("My workload is due to unrealistic deadlines and I feel stretched too thin.");
    expect(report.rephrased_vent_statements).toContain(workloadRephrased);
    expect(report.suggestions_for_boss).toContain(workloadSuggestion);
    expect(report.rephrased_vent_statements).not.toContain(emotionalIntensityNote);
  });

  it('should handle micromanagement theme with new keywords', () => {
    const report = generateBossReport("My boss is breathing down my neck and watches everything I do.");
    expect(report.rephrased_vent_statements).toContain(micromanageRephrased);
    expect(report.suggestions_for_boss).toContain(micromanageSuggestion);
  });

  it('should handle unfairness/bias theme with new keywords like "scold", "blame", "take credit"', () => {
    let report = generateBossReport("I always get scolded for small things, and then my ideas are taken credit for by others.");
    expect(report.rephrased_vent_statements).toContain(unfairRephrased);
    expect(report.suggestions_for_boss).toContain(unfairSuggestion);

    report = generateBossReport("It's unfair how I'm always the first to be blamed.");
    expect(report.rephrased_vent_statements).toContain(unfairRephrased);
    expect(report.suggestions_for_boss).toContain(unfairSuggestion);
  });

  it('should handle communication theme with new keywords like "no feedback", "left in the dark"', () => {
    const report = generateBossReport("We get no feedback on our performance and are often left in the dark about changes.");
    expect(report.rephrased_vent_statements).toContain(communicationRephrased);
    expect(report.suggestions_for_boss).toContain(communicationSuggestion);
  });

  it('should include vulgarity note when vulgar keywords are present AND relevant theme', () => {
    const report = generateBossReport("This fucking workload is too much! I'm so burnt out.");
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

  it('should handle multiple themes in one vent', () => {
    const report = generateBossReport("My workload is too much and it's also unfair how tasks are distributed.");
    expect(report.rephrased_vent_statements).toContain(workloadRephrased);
    expect(report.suggestions_for_boss).toContain(workloadSuggestion);
    expect(report.rephrased_vent_statements).toContain(unfairRephrased);
    expect(report.suggestions_for_boss).toContain(unfairSuggestion);
    expect(report.rephrased_vent_statements).not.toContain(emotionalIntensityNote);
  });

  it('should handle multiple themes with vulgarity', () => {
    const report = generateBossReport("It's fucking bullshit that the workload is so high and the communication is so unclear.");
    expect(report.rephrased_vent_statements).toContain(emotionalIntensityNote);
    expect(report.rephrased_vent_statements).toContain(workloadRephrased);
    expect(report.suggestions_for_boss).toContain(workloadSuggestion);
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

  // Test for "punish" keyword
  it('should handle "punish" keyword for unfairness/bias theme', () => {
    const report = generateBossReport("I feel like I'm being punished for no reason.");
    expect(report.rephrased_vent_statements).toContain(unfairRephrased);
    expect(report.suggestions_for_boss).toContain(unfairSuggestion);
  });
});
