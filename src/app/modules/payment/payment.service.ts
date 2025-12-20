/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { Payment } from './payment.model';
import { TPayment } from './payment.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import mongoose from 'mongoose';
import { stripe } from './payment.utils';
import { MySubscription } from '../mySubscription/mySubscription.model';
import { User } from '../user/user.model';
import { red } from 'colorette';

const createPayment = async (payload: TPayment) => {
  const payment = await Payment.create(payload);
  return payment;
};



const completeSubscriptionPayment = async (res: any, sessionId: string) => {
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    // 1️⃣ Retrieve Stripe Checkout Session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentIntentId = session.payment_intent as string | null;

    if (!paymentIntentId) {
      throw new AppError(400, "Payment intent not found in Stripe session");
    }

    // 2️⃣ Retrieve PaymentIntent to check status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // 3️⃣ Find local payment record by sessionId
    const payment = await Payment.findOne({ paymentId: sessionId }).session(dbSession);
    if (!payment) {
      throw new AppError(404, "Payment record not found for this session");
    }

    // 4️⃣ Update payment status
    if (paymentIntent.status === "succeeded") {
      payment.status = "success";
      payment.paymentMethod = paymentIntent.payment_method_types?.[0] || "card" as any;
      await payment.save({ session: dbSession });

      // 5️⃣ Create new MySubscription
      const expireDate = new Date(new Date().setMonth(new Date().getMonth() + payment.durationInMonths));

      const subscription = await MySubscription.create(
        [
          {
            employerId: payment.employerId,
            type: payment.subscriptionType,
            buyTime: new Date(),
            howManyMonths: payment.durationInMonths,
            expireDate,
            paymentId: payment._id,
            status: "active",
            isDeleted: false,
          },
        ],
        { session: dbSession }
      );

      // 6️⃣ Update User reference to latest MySubscription
      await User.findByIdAndUpdate(
        payment.employerId,
        { mySubscriptionsId: subscription[0]._id },
        { session: dbSession }
      );

      console.log(`✅ Payment completed & new subscription created for employer: ${payment.employerId}`);
    } else {
      payment.status = "failed";
      await payment.save({ session: dbSession });
      console.log(`❌ Payment failed for session: ${sessionId}`);
    }

    await dbSession.commitTransaction();
    dbSession.endSession();

    res.redirect("http://localhost:3000/payment-success");
    // return payment;
  } catch (error) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    console.error("❌ Transaction rolled back due to error:", error);
    throw error;
  }
};

const cancelSubscriptionPayment = async (res: any,sessionId: string) => {
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    // 1️⃣ Find local payment record
    const payment = await Payment.findOne({ paymentId: sessionId }).session(dbSession);
    if (!payment) {
      throw new AppError(404, "Payment record not found for this session");
    }

    // 2️⃣ Only allow cancel if payment is pending
    if (payment.status !== "pending") {
      throw new AppError(400, `Cannot cancel a payment with status: ${payment.status}`);
    }

    // 3️⃣ Cancel the Stripe session (if still pending)
    try {
      await stripe.checkout.sessions.expire(sessionId);
      console.log(`✅ Stripe session ${sessionId} expired successfully`);
    } catch (err) {
      console.warn(`⚠️ Could not expire Stripe session: ${err}`);
      // Continue: the payment record should still be marked as cancelled
    }

    // 4️⃣ Update local payment status
    payment.status = "cancelled";
    await payment.save({ session: dbSession });

    await dbSession.commitTransaction();
    dbSession.endSession();

    // return payment;
    res.redirect("http://localhost:3000/packages");
  } catch (error) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    console.error("❌ Transaction rolled back due to error:", error);
    throw error;
  }
};


const getAllPayments = async (query: Record<string, any> = {}) => {
  const baseFilter = { isDeleted: false };

  const paymentQuery = new QueryBuilder(
    Payment.find(baseFilter).populate('employerId', 'fullName email'),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await paymentQuery.modelQuery;
  const meta = await paymentQuery.countTotal();

  return { meta, result };
};

const getAllPaymentsRecived = async (query: Record<string, any> = {}) => {
  const baseFilter = { isDeleted: false, status: "success" };

  const paymentQuery = new QueryBuilder(
    Payment.find(baseFilter).populate('employerId', 'name email phone companyName'),
    query
  )
     .search(["employerId.name", "employerId.email", "employerId.phone", 'employerId.companyName', "subscriptionType", "paymentId", "paymentMethod"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await paymentQuery.modelQuery;
  const meta = await paymentQuery.countTotal();

  return { meta, result };
};

const getPaymentById = async (id: string) => {
  const payment = await Payment.findById(id);

  if (!payment || payment.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
  }

  return payment;
};

const updatePayment = async (id: string, payload: Partial<TPayment>) => {
  const payment = await Payment.findById(id);

  if (!payment || payment.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
  }

  const updated = await Payment.findByIdAndUpdate(id, payload, { new: true });
  return updated;
};

const deletePayment = async (id: string) => {
  const payment = await Payment.findById(id);

  if (!payment || payment.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
  }

  payment.isDeleted = true;
  await payment.save();

  return true;
};

export const PaymentService = {
  createPayment,
  completeSubscriptionPayment,
  cancelSubscriptionPayment,
  getAllPayments,
  getAllPaymentsRecived,
  getPaymentById,
  updatePayment,
  deletePayment,
};
