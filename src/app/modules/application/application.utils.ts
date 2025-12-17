import AppError from "../../error/AppError";
import { openai } from "../../utils/openAi";
import { Application } from "./application.model";

export const generateAiScoresForJob = async (jobId: string) => {
  const applications = await Application.find({
    jobId,
    aiScore: null,
    isDeleted: false,
  });

  for (const app of applications) {
    await generateAiScoreForApplication(applications._id.toString());
  }

  return { message: "AI scoring completed" };
};



export const generateAiScoreForApplication = async (applicationId: string) => {
  const application = await Application.findById(applicationId)
    .populate("candidateId")
    .populate("jobId");

  if (!application) {
    throw new AppError(404, "Application not found");
  }

  const candidate: any = application.candidateId;
  const job: any = application.jobId;

  if (!candidate || !job) {
    throw new AppError(400, "Candidate or Job data missing");
  }

  // 🔹 Prepare AI Prompt
  const prompt = `
You are an expert technical recruiter.

Job Details:
Title: ${job.title}
Required Skills: ${job.skillsRequired?.join(", ")}
Experience Required: ${job.experience} years
Description: ${job.description}

Candidate Profile:
Name: ${candidate.name}
Skills: ${candidate.skills?.join(", ")}
Experience: ${candidate.yearsOfExperience} years
Designation: ${candidate.designation}
Bio: ${candidate.bio}

Task:
1. Give a match score between 0 and 100
2. Give a short reason (max 2 lines)
3. Respond ONLY in JSON format like this:
{
  "score": number,
  "reason": string
}
`;

  // 🔹 Call OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }],
  });

  const aiResult = JSON.parse(response.choices[0].message.content || "{}");

  // 🔹 Save result
  application.aiScore = aiResult.score ?? 0;
  application.aiReason = aiResult.reason ?? "No reason provided";

  await application.save();

  return {
    applicationId,
    aiScore: application.aiScore,
    aiReason: application.aiReason,
  };
};