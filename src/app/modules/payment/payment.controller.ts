import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { PaymentService } from './payment.service';
import { Request, Response } from 'express';
import AppError from '../../error/AppError';
import { createStripePaymentSession } from './payment.utils';


const createPaymentSession = catchAsync(async (req: Request, res: Response) => {

  const { userId } = req.user;
  req.body.employerId = userId;
  
  const result = await createStripePaymentSession(req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment session created successfully",
    data: result,
  });
});

const createPayment = catchAsync(async (req, res) => {
  const { userId } = req.user;
  req.body.employerId = userId;

  const result = await PaymentService.createPayment(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Payment created successfully',
    data: result,
  });
});

 const completeSubscriptionPayment = catchAsync(async (req: Request, res: Response) => {

  const { session_id } = req.query;

    if (!session_id) {
      throw new AppError(400, "Missing sessionId ");
    }

  

  const result = await PaymentService.completeSubscriptionPayment( res,
    String(session_id)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment confirmed successfully",
    data: result,
  });
});

const cancelSubscriptionPayment = catchAsync(async (req: Request, res: Response) => {

  const { session_id } = req.query;

    if (!session_id) {
      throw new AppError(400, "Missing sessionId ");
    }

  

  const result = await PaymentService.cancelSubscriptionPayment(
    res,
    String(session_id)
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment cancelled successfully",
    data: result,
  });
  
});

  

const getAllPayments = catchAsync(async (req, res) => {
  const result = await PaymentService.getAllPayments(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payments fetched successfully',
    data: result,
  });
});

const getAllPaymentsRecived = catchAsync(async (req, res) => {
  const result = await PaymentService.getAllPaymentsRecived(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Recived payments fetched successfully',
    data: result,
  });

})

const getPaymentById = catchAsync(async (req, res) => {
  const result = await PaymentService.getPaymentById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payment fetched successfully',
    data: result,
  });
});

const updatePayment = catchAsync(async (req, res) => {
  const result = await PaymentService.updatePayment(req.params.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payment updated successfully',
    data: result,
  });
});

const deletePayment = catchAsync(async (req, res) => {
  await PaymentService.deletePayment(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payment deleted successfully',
    data: null,
  });
});

export const PaymentController = {
  createPaymentSession,
  createPayment,
  completeSubscriptionPayment,
  cancelSubscriptionPayment,
  getAllPayments,
  getAllPaymentsRecived,
  getPaymentById,
  updatePayment,
  deletePayment,
};
