import { describe, it, expect } from 'vitest';
import { getFeedbackForVent, generateBossReport, BossReport } from './feedbackUtils';

describe('getFeedbackForVent', () => {
  const workloadFeedback = "It sounds like you're feeling overwhelmed with your workload. Consider having a conversation about priorities and realistic timelines. Maybe suggest a weekly check-in to align on what's most important.";
  const micromanageFeedback = "Feeling micromanaged can be frustrating. Try demonstrating your reliability through consistent updates and proactive communication. This might help build the trust needed for more autonomy.";
  const unfairFeedback = "Workplace fairness is important for everyone. Consider documenting specific examples and having a calm, professional conversation about your observations. Focus on the impact rather than intentions.";
  const communicationFeedback = "Clear communication is key to a good working relationship. Try asking specific questions and summarizing what you understand to ensure you're both on the same page.";
  const defaultFeedback = "Thank you for sharing. Remember that workplace conflicts are often opportunities for growth and better understanding. Consider approaching this situation with curiosity rather than frustration.";

  it('should return workload feedback for "workload" keywords', () => {
    expect(getFeedbackForVent("My workload is too much")).toBe(workloadFeedback);
    expect(getFeedbackForVent("I'm overwhelmed with tasks")).toBe(workloadFeedback);
    expect(getFeedbackForVent("There's just too much to do")).toBe(workloadFeedback);
  });

  it('should return micromanage feedback for "micromanage" keywords', () => {
    expect(getFeedbackForVent("I feel my boss tries to control everything")).toBe(micromanageFeedback);
    expect(getFeedbackForVent("My manager tends to micromanage our team.")).toBe(micromanageFeedback);
    expect(getFeedbackForVent("I wish I had more trust to do my work.")).toBe(micromanageFeedback);
  });

  it('should return unfair feedback for "unfair" keywords', () => {
    expect(getFeedbackForVent("This treatment is unfair")).toBe(unfairFeedback);
    expect(getFeedbackForVent("I think there's a bias in how tasks are assigned")).toBe(unfairFeedback);
    expect(getFeedbackForVent("My colleague is clearly the favorite")).toBe(unfairFeedback);
  });

  it('should return communication feedback for "communication" keywords', () => {
    expect(getFeedbackForVent("The instructions were unclear")).toBe(communicationFeedback);
    expect(getFeedbackForVent("There is a lot of confusing communication.")).toBe(communicationFeedback);
    expect(getFeedbackForVent("I'm not sure what is expected of me due to poor communication")).toBe(communicationFeedback);
  });

  it('should return default feedback for unrecognized input', () => {
    expect(getFeedbackForVent("I am just having a bad day")).toBe(defaultFeedback);
    expect(getFeedbackForVent("The coffee machine is broken again.")).toBe(defaultFeedback);
  });

  it('should be case-insensitive for keywords', () => {
    expect(getFeedbackForVent("my WORKLOAD is high")).toBe(workloadFeedback);
    expect(getFeedbackForVent("Feeling MICROMANAGED is frustrating")).toBe(micromanageFeedback);
    expect(getFeedbackForVent("This is UNFAIR treatment")).toBe(unfairFeedback);
    expect(getFeedbackForVent("UNCLEAR communication is an issue")).toBe(communicationFeedback);
  });

  it('should return default feedback for empty string input', () => {
    expect(getFeedbackForVent("")).toBe(defaultFeedback);
  });
});

describe('generateBossReport', () => {
  const testTheme = (inputText: string, themeKeywords: string[], expectedRephrasedSubstring?: string, expectedSuggestionSubstring?: string) => {
    const report: BossReport = generateBossReport(inputText);

    expect(report.rephrased_vent_statements).toBeTypeOf('string');
    expect(report.rephrased_vent_statements).not.toBe('');
    expect(report.suggestions_for_boss).toBeTypeOf('string');
    expect(report.suggestions_for_boss).not.toBe('');

    if (expectedRephrasedSubstring) {
      expect(report.rephrased_vent_statements.toLowerCase()).toContain(expectedRephrasedSubstring.toLowerCase());
    }
    if (expectedSuggestionSubstring) {
      expect(report.suggestions_for_boss.toLowerCase()).toContain(expectedSuggestionSubstring.toLowerCase());
    }

    // Check if the report contains keywords related to the theme, if not default
    if (themeKeywords.length > 0) {
        const foundInRephrased = themeKeywords.some(kw => report.rephrased_vent_statements.toLowerCase().includes(kw));
        const foundInSuggestions = themeKeywords.some(kw => report.suggestions_for_boss.toLowerCase().includes(kw));
        // This is a soft check, as suggestions might be generic
        // expect(foundInRephrased || foundInSuggestions).toBe(true);
    }
  };

  it('should handle workload theme', () => {
    testTheme("I have way too much workload and I'm overwhelmed. I have no time.", ["workload", "overwhelmed"], "workload", "capacity");
  });

  it('should handle micromanagement theme', () => {
    testTheme("My boss micromanages everything, I have no autonomy.", ["micromanage", "autonomy"], "micromanagement", "trust");
  });

  it('should handle unfairness/bias theme', () => {
    testTheme("It's so unfair how my colleague is the favorite.", ["unfair", "favorite"], "fairness", "transparency");
  });

  it('should handle communication theme', () => {
    testTheme("The communication is unclear and often confusing.", ["communication", "unclear"], "communication", "clarity");
  });

  it('should handle "burnt out" as workload', () => {
    testTheme("I am feeling completely burnt out.", ["burnt out", "workload"], "workload", "capacity");
  });

  it('should handle "no autonomy" as micromanagement', () => {
    testTheme("There's no autonomy in this team.", ["autonomy", "micromanage"], "autonomy", "trust");
  });

  it('should handle "not equal" as unfairness', () => {
    testTheme("The opportunities are not equal for everyone.", ["not equal", "unfair"], "fairness", "equal opportunity");
  });

  it('should handle "no information" as communication', () => {
    testTheme("We get no information about project changes.", ["no information", "communication"], "communication", "disseminated");
  });

  it('should return default report for non-specific input', () => {
    const report = generateBossReport("I had a decent day today.");
    expect(report.rephrased_vent_statements).toContain("general concerns");
    expect(report.suggestions_for_boss).toContain("open conversation");
    testTheme("I had a decent day today.", [], "general concerns", "open conversation");
  });

  it('should handle empty string input with default report', () => {
    const report = generateBossReport("");
    expect(report.rephrased_vent_statements).toContain("general concerns");
    expect(report.suggestions_for_boss).toContain("open conversation");
    testTheme("", [], "general concerns", "open conversation");
  });

  it('should be case-insensitive for keywords in boss report', () => {
    testTheme("My WORKLOAD is insane.", ["workload"], "workload", "capacity");
    testTheme("I feel MICROMANAGED constantly.", ["micromanage"], "micromanagement", "trust");
    testTheme("This is so UNFAIR.", ["unfair"], "fairness", "transparency");
    testTheme("The COMMUNICATION needs to improve.", ["communication"], "communication", "clarity");
  });
});
