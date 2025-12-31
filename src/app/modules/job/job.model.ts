import { Schema, model } from 'mongoose';
import { TJob } from './job.interface';

const jobSchema = new Schema<TJob>(
  {
    employerId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    jobReferralCode: {
      type: String,
      required: true,
      unique: true,
    },
    title: { 
        type: String, 
        required: true 
    },
    location: {
      type: String,
      required: true
    },
    jobType: {
      type: String,
      enum: ['Onsite', 'Remote', 'Hybrid'],
      required: true,
    },
    salaryRange: {
      min: { 
        type: Number, 
        required: true },
      max: { 
        type: Number, 
        required: true },
    },

    experience: { 
        type: Number, 
        required: true 
    },

    workType: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Temporary'],
      required: true,
    },
    lengthOfWork: {
      type: String,
      default: ""
    },
    paymentType: {
      type: String,
      enum: ['Monthly', "Hourly"]
    },
    annualPay: {
      type: Number,
      default: 0
    },
    hourlyRequired: {
      type: Number,
      default: 0
    },
    startDate: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    finishTime: {
      type: String,
      required: true
    },
    daysOfWork: {
      type: [ String ],
      required: true
    },
    workersNeeded: {
      type: Number,
      required: true
    },


    description: { 
        type: String, 
        required: true 
    },

    keyResponsibilities: {
      type: [String],
      required: true,
    },

    requirements: {
      type: [String],
      required: true,
    },

    benefits: {
      type: [String],
      default: [],
    },

    skillsRequired: {
      type: [String],
      default: [],
    },

    lastApplyDate: { 
        type: Date, 
        required: true 
    },

    status: {
      type: String,
      enum: ['New', 'Cvs Sent', "Closed"],
      default: 'New',
    },

    isDeleted: { 
        type: Boolean, default: false 
    },

    

    
  },
  { timestamps: true },
);

const Job = model<TJob>('Job', jobSchema);
export default Job;
