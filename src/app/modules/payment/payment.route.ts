import { Router } from 'express';
import { PaymentController } from './payment.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { paymentValidation } from './payment.validation';
import { USER_ROLE } from '../user/user.constants';

export const paymentRoutes = Router();

// Employer creates payment
paymentRoutes
        .post(
          "/create-session",
          auth(USER_ROLE.EMPLOYER),
          validateRequest(paymentValidation.createStripePaymentSchema),
          PaymentController.createPaymentSession
        )

        .get(
          "/confirm-payment",
          PaymentController.completeSubscriptionPayment
        )
        
        .post(
          '/',
          auth(USER_ROLE.EMPLOYER),
          validateRequest(paymentValidation.createPaymentSchema),
          PaymentController.createPayment
        )


        // Get all payments (admin)
        .get(
          '/',
          auth(USER_ROLE.ADMIN),
          PaymentController.getAllPayments
        )

        .get(
          "/recived",
          auth(USER_ROLE.ADMIN),
          PaymentController.getAllPaymentsRecived
        )

        .get(
          "/cancel",
          PaymentController.cancelSubscriptionPayment
        )


        // Get payment by ID
        .get(
          '/:id',
          auth(USER_ROLE.ADMIN, USER_ROLE.EMPLOYER),
          PaymentController.getPaymentById
        )

        // Update payment
        .patch(
          '/:id',
          auth(USER_ROLE.ADMIN, USER_ROLE.EMPLOYER),
          validateRequest(paymentValidation.updatePaymentSchema),
          PaymentController.updatePayment
        )

        // Soft delete payment
        .delete(
          '/:id',
          auth(USER_ROLE.ADMIN),
          PaymentController.deletePayment
        );
