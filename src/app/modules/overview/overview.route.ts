import { Router } from "express";
import { OverviewController } from "./overview.controller";


export const overviewRoutes = Router();

overviewRoutes
.get(
  '/admin/user-statistics',
  OverviewController.getUserOverviewByYear
)

.get(
  '/admin/earning-statistics',
  OverviewController.getEarningsOverviewByYear
)

.get(
  "/admin/total-overview",
  OverviewController.adminOverview
)

.get(
    "/cv-dispatch",
    OverviewController.CvDispatchOverview
)

.get(
  "/placement",
  OverviewController.placementOverview
)