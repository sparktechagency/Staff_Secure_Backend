import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes } from "../modules/auth/auth.route";
import { otpRoutes } from "../modules/otp/otp.routes";
import { settingsRoutes } from "../modules/setting/setting.route";
import { notificationRoutes } from "../modules/notifications/notifications.route";
import path from "path";
import { JobRoutes } from "../modules/job/job.route";
import { ChatRoutes } from "../modules/chat/chat.route";
import { applicationRoutes } from "../modules/application/application.routes";
import { overviewRoutes } from "../modules/overview/overview.route";
import { mySubscriptionRoutes } from "../modules/mySubscription/mySubscription.routes";
import { messageRoutes } from "../modules/message/message.route";
import { paymentRoutes } from "../modules/payment/payment.route";

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: "/otp",
    route: otpRoutes
  },
  {
    path: "/settings",
    route: settingsRoutes
  },
  {
     path: "/notifications",
     route: notificationRoutes
  },
  {
    path: "/job",
    route: JobRoutes
  },
  {
    path: "/application",
    route: applicationRoutes
  },
  {
    path: "/chat",
    route: ChatRoutes
  },
  {
    path: "/message",
    route: messageRoutes
  },
  {
    path: "/overview",
    route: overviewRoutes
  },
  {
    path: "/payment",
    route: paymentRoutes
  },
  {
    path: "/subscription",
    route: mySubscriptionRoutes
  }


];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;