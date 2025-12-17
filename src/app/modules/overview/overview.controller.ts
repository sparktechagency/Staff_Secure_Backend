import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { OverviewService } from "./overview.service";
import httpStatus from 'http-status';

const getUserOverviewByYear = catchAsync(async (req, res) => {
    let { role, year } = req.query;

    // Default values
    role = role ? String(role) : "candidate";
    year = year ? Number(year) : new Date().getFullYear();

    const result = await OverviewService.getUserOverviewByYear(role as 'candidate' | 'employer', Number(year));

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'User Overview statistics fetched successfully',
        data: result,
    });
});

const getEarningsOverviewByYear = catchAsync(async (req, res) => {
    let year = req.query.year;
    year = year ? Number(year) : new Date().getFullYear();

    const result = await OverviewService.getEarningsOverviewByYear(Number(year));

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Earnings Overview statistics fetched successfully',
        data: result,
    });
})

const adminOverview = catchAsync(async (req, res) => {

    const result = await OverviewService.adminOverview();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Overview of Admin fetched successfully',
        data: result,
    });

});

const CvDispatchOverview = catchAsync(async (req, res) => {

    const result = await OverviewService.CvDispatchOverview();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Overview of Cv Dispatch fetched successfully',
        data: result,
    });

});

const placementOverview = catchAsync(async (req, res) => {

  const result = await OverviewService.placementOverview();

  sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Overview of Placement fetched successfully',
      data: result,
  })
})
export const OverviewController = {
    getUserOverviewByYear,
    getEarningsOverviewByYear,
    adminOverview,
    CvDispatchOverview,
    placementOverview
}
