import { describe, it, expect } from 'vitest';
import { getFeedbackForVent } from './feedbackUtils';

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
