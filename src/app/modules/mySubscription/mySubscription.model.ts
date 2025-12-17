import { model, Schema } from 'mongoose';
import { TMySubscription } from './mySubscription.interface';

const mySubscriptionSchema = new Schema<TMySubscription>(
  {
    employerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['Bronze', 'Platinum', 'Diamond'],
      required: true,
    },
    buyTime: {
      type: Date,
      default: new Date(),
    },
    howManyMonths: {
      type: Number,
      required: true,
    },
    expireDate: {
      type: Date,
      required: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const MySubscription = model<TMySubscription>('MySubscription', mySubscriptionSchema);
