import { Types } from "mongoose";

export type TSalaryRange = {
  min: number;
  max: number;
};

export type TJobType = 'Onsite' | 'Remote' | 'Hybrid';
export type TJobStatus = 'New' | 'Cvs Sent' | 'Closed';
export type TWorkType = 'Full-Time' | 'Part-Time' | 'Contract';

export type TJob = {
  employerId: Types.ObjectId; // ref User
  jobReferralCode: string;
  title: string;
  location: string;
  jobType: TJobType;
  salaryRange: TSalaryRange;
  experience: number;
  workType: TWorkType;
  workersNeeded: number;
  description: string;
  keyResponsibilities: string[];
  requirements: string[];
  benefits: string[];
  skillsRequired: string[];
  lastApplyDate: Date;
  status: TJobStatus;
  isDeleted: boolean;
  
};
