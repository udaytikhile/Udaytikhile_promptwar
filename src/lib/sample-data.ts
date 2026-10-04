import type { AnalysisResponse } from "./schema";

/**
 * Static sample result for the internship example.
 * Used as fallback when the API is unavailable.
 */
export const SAMPLE_RESULT: AnalysisResponse = {
  needs_more_info: false,
  clarifying_questions: [],
  visible_factors: [
    "The stipend amount and financial benefit",
    "Proximity to home — convenience and comfort",
    "Gaining industry experience during college",
  ],
  assumptions: [
    {
      text: "A general 'operations' role will provide meaningful industry experience",
      evidence: "You mention wanting 'industry experience' but the role is described as general 'operations'",
      why_it_matters: "Not all internships build transferable skills equally. A vague role title could mean highly varied day-to-day work, some of which might not align with your career interests.",
      how_to_test: "Ask the company for a week-by-week breakdown of typical tasks, or speak with past interns about what they actually did.",
    },
    {
      text: "Managing 40 hours of work alongside classes and exams is feasible",
      evidence: "You noted '40 hrs/week' and 'college has ongoing semester classes and exams'",
      why_it_matters: "A full-time workload during an active semester could affect both academic performance and internship quality, without either getting your full attention.",
      how_to_test: "Map out a typical week hour-by-hour including commute, classes, study time, and sleep to see if it physically fits.",
    },
  ],
  overlooked: [
    {
      category: "academics",
      text: "Impact on semester grades and attendance requirements",
      evidence: "You mention 'ongoing semester classes and exams' but do not discuss how 40 hrs/week affects attendance, assignments, or GPA",
    },
    {
      category: "learning_quality",
      text: "Whether 'general operations' aligns with your field of study or career goals",
      evidence: "The role is 'general operations' — you haven't mentioned what you're studying or what career direction you're aiming for",
    },
    {
      category: "reversibility",
      text: "What happens if you need to leave the internship mid-way, or if you fail a course",
      evidence: "A 6-month commitment overlapping with a semester suggests limited flexibility if either isn't working out",
    },
    {
      category: "alternatives",
      text: "Whether shorter or part-time internships, or summer-only options, could provide similar benefits with less conflict",
      evidence: "You present this as the option without mentioning what alternatives you've considered",
    },
    {
      category: "upside",
      text: "The internship could open doors to a full-time offer or professional network you wouldn't otherwise access",
      evidence: "You mention 'industry experience' but haven't considered the networking or career pipeline potential",
    },
  ],
  conflicts: [
    {
      text: "Wanting industry experience while also being enrolled in active coursework creates a direct time conflict",
      evidence: "You list 'industry experience' as a reason to accept, but also note the '40 hrs/week' role runs during 'ongoing semester classes and exams'",
    },
    {
      text: "Valuing the stipend while potentially risking academic progress that the degree represents",
      evidence: "The 'good stipend' is a key driver, but a delayed or damaged degree could cost more long-term than the stipend provides",
    },
  ],
  questions: [
    "Have you spoken with your academic advisor about whether your course load allows for full-time work, and are there any attendance minimums you might miss?",
    "What specific skills or experiences do you hope to gain — and has the company confirmed the role would involve those?",
    "If your grades drop significantly this semester, what would that mean for your degree timeline and future opportunities?",
    "Is the 6-month duration negotiable, or could you start after exams end?",
    "What would you do with this semester if you didn't take the internship — is there something else you'd pursue?",
  ],
  safety_note: null,
};
