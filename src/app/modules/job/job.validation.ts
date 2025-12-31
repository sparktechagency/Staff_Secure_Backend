import { z } from 'zod';

/*
|--------------------------------------------------------------------------
| Shared Schemas
|--------------------------------------------------------------------------
*/

const salaryRangeSchema = z
  .object({
    min: z.number().nonnegative({
      message: 'Minimum salary must be greater than or equal to 0',
    }),
    max: z.number().nonnegative({
      message: 'Maximum salary must be greater than or equal to 0',
    }),
  })
  .refine((data) => data.max >= data.min, {
    message: 'Maximum salary must be greater than or equal to minimum salary',
    path: ['max'],
  });

/*
|--------------------------------------------------------------------------
| Create Job Validation
|--------------------------------------------------------------------------
*/

const createJobValidationSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Job title is required',
    }),

    location: z.string({
      required_error: 'Job location is required',
    }),

    lengthOfWork: z.string({
      required_error: 'Length of work is required',
    }),

    paymentType: z.enum(['Monthly', 'Hourly'], {
      required_error: 'Payment type is required',
    }),

    annualPay: z.number().nonnegative().optional(),

    hourlyRequired: z.number().nonnegative().optional(),

    startDate: z.string({
      required_error: 'Start date is required',
    }),

    startTime: z.string({
      required_error: 'Start time is required',
    }),

    finishTime: z.string({
      required_error: 'Finish time is required',
    }),

    daysOfWork: z
      .array(z.string())
      .min(1, { message: 'At least one working day is required' }),

    jobType: z.enum(['Onsite', 'Remote', 'Hybrid'], {
      required_error: 'Job type is required',
    }),

    salaryRange: salaryRangeSchema,

    experience: z.number({
      required_error: 'Experience is required',
    }),

    workType: z.enum(['Full-Time', 'Part-Time', 'Temporary'], {
      required_error: 'Work type is required',
    }),

    workersNeeded: z.number({
      required_error: 'Number of workers needed is required',
    }),

    description: z.string({
      required_error: 'Job description is required',
    }),

    keyResponsibilities: z
      .array(z.string())
      .min(1, { message: 'At least one responsibility is required' }),

    requirements: z
      .array(z.string())
      .min(1, { message: 'At least one requirement is required' }),

    benefits: z.array(z.string()).optional(),

    skillsRequired: z.array(z.string()).optional(),

    lastApplyDate: z.string({
      required_error: 'Last apply date is required',
    }),

    status: z.enum(['New', 'Cvs Sent', 'Closed']).optional(),

    isDeleted: z.boolean().optional(),
  })
  // Conditional validation
  .superRefine((data, ctx) => {
    if (data.paymentType === 'Monthly' && data.annualPay === undefined) {
      ctx.addIssue({
        path: ['annualPay'],
        message: 'Annual pay is required for monthly payment type',
        code: z.ZodIssueCode.custom,
      });
    }

    if (data.paymentType === 'Hourly' && data.hourlyRequired === undefined) {
      ctx.addIssue({
        path: ['hourlyRequired'],
        message: 'Hourly rate is required for hourly payment type',
        code: z.ZodIssueCode.custom,
      });
    }
  }),
});

/*
|--------------------------------------------------------------------------
| Update Job Validation
|--------------------------------------------------------------------------
*/

const updateJobValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    location: z.string().optional(),
    lengthOfWork: z.string().optional(),
    paymentType: z.enum(['Monthly', 'Hourly']).optional(),
    annualPay: z.number().nonnegative().optional(),
    hourlyRequired: z.number().nonnegative().optional(),
    startDate: z.string().optional(),
    startTime: z.string().optional(),
    finishTime: z.string().optional(),
    daysOfWork: z.array(z.string()).optional(),
    salaryRange: salaryRangeSchema.optional(),
    experience: z.number().optional(),
    workType: z.enum(['Full-Time', 'Part-Time', 'Temporary']).optional(),
    workersNeeded: z.number().optional(),
    description: z.string().optional(),
    keyResponsibilities: z.array(z.string()).optional(),
    requirements: z.array(z.string()).optional(),
    benefits: z.array(z.string()).optional(),
    skillsRequired: z.array(z.string()).optional(),
    lastApplyDate: z.string().optional(),
    status: z.enum(['New', 'Cvs Sent', 'Closed']).optional(),
    jobType: z.enum(['Onsite', 'Remote', 'Hybrid']).optional(),
    isDeleted: z.boolean().optional(),
  }),
});

/*
|--------------------------------------------------------------------------
| Update Job Status Validation
|--------------------------------------------------------------------------
*/

const updateJobStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(['New', 'Cvs Sent', 'Closed'], {
      required_error: 'Job status is required',
    }),
  }),
});

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

export const JobValidation = {
  createJobValidationSchema,
  updateJobValidationSchema,
  updateJobStatusValidationSchema,
};
