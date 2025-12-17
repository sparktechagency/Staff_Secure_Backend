import { z } from 'zod';

const salaryRangeSchema = z.object({
  min: z.number().nonnegative({ message: "Minimum salary must be >= 0" }),
  max: z.number().nonnegative({ message: "Maximum salary must be >= 0" }),
});

export const createJobValidationSchema = z.object({
  body: z.object({

    title: z.string({ required_error: "Title is required!" }),

    salaryRange: salaryRangeSchema,
    
    jobType: z.enum(["Onsite", "Remote", "Hybrid"], {
      required_error: "Job type is required!",
    }),

    experience: z.number({
      required_error: "Experience is required!",
    }),

    workType: z.enum(["Full-Time", "Part-Time", "Contract"], {
      required_error: "Workers needed (type) is required!",
    }),
    workersNeeded: z.number({
      required_error: "Workers needed (number) is required!",
    }),

    description: z.string({
      required_error: "Description is required!",
    }),

    keyResponsibilities: z
      .array(z.string())
      .min(1, { message: "At least 1 responsibility is required" }),

    requirements: z
      .array(z.string())
      .min(1, { message: "At least 1 requirement is required" }),

    benefits: z.array(z.string()).optional(),

    skillsRequired: z.array(z.string()).optional(),

    lastApplyDate: z.string({
      required_error: "last apply date is required!",
    }),

    status: z.enum(["New", "Cvs Sent"]).optional(),

    isDeleted: z.boolean().optional(),

    
  }),
});

export const updateJobValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    salaryRange: salaryRangeSchema.optional(),
    experience: z.number().optional(),
    workType: z.enum(["Full-Time", "Part-Time", "Contract"]).optional(),
    description: z.string().optional(),
    keyResponsibilities: z.array(z.string()).optional(),
    requirements: z.array(z.string()).optional(),
    benefits: z.array(z.string()).optional(),
    skillsRequired: z.array(z.string()).optional(),
    expireDate: z.string().optional(),
    status: z.enum(["active", "closed"]).optional(),
    jobType: z.enum(["Onsite", "Remote", "Hybrid"]).optional(),
  }),
});

const updateJobStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(["active", "closed"], {
      required_error: "Status is required!",
    })
  }),
})

export const JobValidation = {
  createJobValidationSchema,
  updateJobValidationSchema,
  updateJobStatusValidationSchema
};
