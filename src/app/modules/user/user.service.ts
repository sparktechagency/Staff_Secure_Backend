/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status'
import AppError from '../../error/AppError'
import { User } from './user.model'
import config from '../../config'
import { otpServices } from '../otp/otp.service'
import { generateOptAndExpireTime } from '../otp/otp.utils'
import { TPurposeType } from '../otp/otp.interface'
import { otpSendEmail } from '../../utils/eamilNotifiacation'
import { createToken, verifyToken } from '../../utils/tokenManage'
import mongoose, { Types } from 'mongoose'
import { getAdminId } from '../../DB/adminStrore'
import { emitNotification } from '../../../socketIo'
import { USER_ROLE, USER_STATUS, UserRole } from './user.constants'
import { CandidateProfile } from '../candidateProfile/candidateProfile.model'
import { TUser, TUserCreate } from './user.interface'
import { ChatService } from '../chat/chat.service'
import QueryBuilder from '../../builder/QueryBuilder'
import { get } from 'http'
import { ICandidateProfile } from '../candidateProfile/candidateProfile.interface'
import { MySubscription } from '../mySubscription/mySubscription.model'
import { Application } from '../application/application.model'
import Message from '../message/message.model'

export interface OTPVerifyAndCreateUserProps {
  otp: string
  token: string
}

const createUserToken = async (payload: TUserCreate) => {
  console.log('before create user => >> ', { payload })

  const { name, email, password, role, companyName, phone } = payload

  // user exist check
  const userExist = await User.isUserExist(email)

  if (userExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exist!!')
  }

  const { isExist, isExpireOtp } = await otpServices.checkOtpByEmail(
    email,
    'email-verification'
  )

  const { otp, expiredAt } = generateOptAndExpireTime()

  let otpPurpose: TPurposeType = 'email-verification'

  if (isExist && !isExpireOtp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'otp-exist. Check your email.')
  } else if (isExist && isExpireOtp) {
    const otpUpdateData = {
      otp,
      expiredAt,
    }

    await otpServices.updateOtpByEmail(email, otpPurpose, otpUpdateData)
  } else if (!isExist) {
    await otpServices.createOtp({
      name: 'Customer',
      sentTo: email,
      receiverType: 'email',
      purpose: otpPurpose,
      otp,
      expiredAt,
    })
  }

  const otpBody: Partial<TUserCreate> = {
    name,
    email,
    password,
    role,
    companyName,
    phone,
  }

  // send email
  process.nextTick(async () => {
    await otpSendEmail({
      sentTo: email,
      subject: 'Your one time otp for email  verification',
      name: 'Customer',
      otp,
      expiredAt: expiredAt,
    })
  })

  // crete token
  const createUserToken = createToken({
    payload: otpBody,
    access_secret: config.jwt_access_secret as string,
    expity_time: config.otp_token_expire_time as string | number,
  })

  return createUserToken
}

const otpVerifyAndCreateUser = async ({
  otp,
  token,
}: OTPVerifyAndCreateUserProps) => {
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found')
  }

  const decodeData = verifyToken({
    token,
    access_secret: config.jwt_access_secret as string,
  })

  if (!decodeData) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorised')
  }

  console.log({decodeData})
  const { name, email, password, role, companyName, phone } = decodeData

  // // Check OTP
  // const isOtpMatch = await otpServices.otpMatch(
  //   email,
  //   'email-verification',
  //   otp
  // )

  // if (!isOtpMatch) {
  //   throw new AppError(httpStatus.BAD_REQUEST, 'OTP did not match')
  // }

  // // Update OTP status
  // await otpServices.updateOtpByEmail(email, 'email-verification', {
  //   status: 'verified',
  // })

  // Check if user exists
  const isExist = await User.isUserExist(email as string)

  if (isExist) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'User already exists with this email'
    )
  }

  // Create user + profile atomically with transaction
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const user = await User.create(
      [
        {
          name,
          email,
          password,
          role,
          companyName,
          phone,
          status: USER_STATUS.ACTIVE,
        },
      ],
      { session }
    )


    console.log("user => >> ", user[0]);
    // create chat with admin
    await ChatService.createChatWithAdmin(user[0]._id.toString())

    await session.commitTransaction()
    session.endSession()

    const notificationData = {
      userId: user[0]._id,
      receiverId: getAdminId(),
      message: 'New user registered',
    } as any

    // emit notification in background, don’t block response
    emitNotification(notificationData).catch((err) => {
      console.error('Notification emit failed:', err)
    })
    // Generate access token
    const jwtPayload = {
      userId: user[0]._id.toString(),
      name: user[0].name || '',
      email: user[0].email,
      role: user[0].role,
      companyName: user[0].companyName || '',
      phone: user[0].phone || '',
      CandidateProfileId: user[0].candidateProfileId || '',
      status: user[0].status,
    }

    return createToken({
      payload: jwtPayload,
      access_secret: config.jwt_access_secret as string,
      expity_time: '5m',
    })
  } catch (error) {

    console.log("error", error  )
    await session.abortTransaction()
    session.endSession()
    throw new AppError(httpStatus.BAD_REQUEST, 'User creation failed')
  }
}




const updateUser = async (id: string, payload: Partial<TUser>) => {


  const { role, email, status, isDeleted,password, ...rest } = payload;

  const isUserExist = await User.findById(id);

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }


  const user = await User.findByIdAndUpdate(id, rest, { new: true });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User updating failed');
  }

  if(rest.name !== isUserExist.name && isUserExist.candidateProfileId){
     await CandidateProfile.updateOne(
      { _id: isUserExist.candidateProfileId },
      { name: rest.name }
    )
  }

  return user;
};

const updateUserCandidateProfile = async (
  user: any,
  payload: Partial<ICandidateProfile>
) => {
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  // Destructure payload and prevent email update
  const { email, ...rest } = payload;
  let candidateProfile;

  if (user.candidateProfileId) {
    
    console.log("update data =>>> ",rest);
    // Update existing candidate profile
    candidateProfile = await CandidateProfile.findByIdAndUpdate(
      user.candidateProfileId,
      rest,
      { new: true }
    );

    if (!candidateProfile) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Candidate profile update failed');
    }

  } else {
    
    rest.userId = user._id;
    (rest as any).email = user.email;
    console.log({ rest });
    // Create new candidate profile
    candidateProfile = await CandidateProfile.create(rest);
    user.candidateProfileId = candidateProfile._id as mongoose.Types.ObjectId;
  }

  // Update user's name if provided
  if (rest.name) {
    user.name = rest.name;
  }

    const jwtPayload: {
      userId: string;
      name: string;
      companyName: string;
      email: string;
      role: string;
      candidateProfileId:  Types.ObjectId | null
    } = {
      userId: user?._id?.toString() as string,
      name: rest.name || user.name || '',
      companyName: user.companyName || '',
      email: user.email,
      role: user?.role,
      candidateProfileId: user.candidateProfileId || null
    };
  
    const accessToken = createToken({
      payload: jwtPayload,
      access_secret: config.jwt_access_secret as string,
      expity_time: config.jwt_access_expires_in as string,
    });
  
    const refreshToken = createToken({
      payload: jwtPayload,
      access_secret: config.jwt_refresh_secret as string,
      expity_time: config.jwt_refresh_expires_in as string,
    });
  // Save user
  const result = await user.save();
  console.log({result});

  return {  accessToken, refreshToken, candidateProfile };
};

const updateUserStatus = async (id: string, status: 'active' | 'blocked') => {

  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  if(status !== 'active' && status !== 'blocked'){
    throw new AppError(httpStatus.BAD_REQUEST, 'Status not found');
  }

  const user = await User.findByIdAndUpdate(id, { status }, { new: true });

  return user;
}



const deleteUser = async (id: string) => {
  const user = await User.findByIdAndDelete(id);
  return user;
};



const getMyProfile  = async (userId: string) => {
  const result = await User.findById(userId).populate("candidateProfileId").lean();
  return result
}

const getMyCandidateProfile = async (userId: string) => {
  const result = await User.findById(userId).populate("candidateProfileId").lean();
  return result
}

const getAllEmployers = async (
  query: Record<string, unknown>
) => {

  /* 1️⃣ Base query using QueryBuilder */
  const employerQuery = new QueryBuilder(
    User.find({ role: USER_ROLE.EMPLOYER, isDeleted: false }),
    query
  )
    .search(['name', 'companyName', 'email', 'phone'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const employers = await employerQuery.modelQuery;

  /* 2️⃣ Count for pagination */
  const meta = await employerQuery.countTotal();

  /* 3️⃣ Enrich each employer */
  const data = await Promise.all(
    employers.map(async (employer: any) => {
      /* Subscription */
      const subscription = await MySubscription.findById(
        employer.mySubscriptionsId
      );

      /* CV USED COUNT (from buyTime → forwardedAt) */
      let usedCV = 0;
      if (subscription) {
        usedCV = await Application.countDocuments({
          jobProviderOwnerId: employer._id,
          forwardedAt: { $ne: null, $gte: subscription.buyTime },
          isDeleted: false,
        });
      }

      /* Unread Message */
      const hasUnreadMessage = await Message.exists({
        sender: employer._id, // adjust if chat schema differs
        seen: false,
        isDeleted: false,
      });

      /* CV LIMIT */
      const CV_LIMIT: Record<string, number | null> = {
        Bronze: 3,
        Platinum: 10,
        Diamond: null,
      };

      const limit = subscription
        ? CV_LIMIT[subscription.type]
        : 0;

      return {
        _id: employer._id,
        name: employer.name,
        companyName: employer.companyName,
        email: employer.email,
        phone: employer.phone,
        status: employer.status,

        packageType: subscription?.type ?? null,
        subscriptionStatus: subscription?.status ?? null,
        renewalDate: subscription?.expireDate ?? null,

        cvUsage:
          limit === null
            ? `${usedCV}/Unlimited`
            : `${usedCV}/${limit}`,

        hasUnreadMessage: Boolean(hasUnreadMessage),
      };
    })
  );

  return {
    meta,
    data,
  };
};

const getAllCandidates = async (query: Record<string, any> = {}) => {

  const baseFilter = {
    role: USER_ROLE.CANDIDATE,
    isDeleted: false,
  };


  const candidateQuery = new QueryBuilder(
    User.find(baseFilter).populate({
      path: 'candidateProfileId',
      select: 'location designation skills yearsOfExperience dateOfBirth bio cv availability qualifications',
    }),
    query,
  )
    .search(['name', 'phone'])
    .filter()
    .sort()
    .paginate()
    .fields();

  /**
   * Step 4: Execute query
   */
  const result = await candidateQuery.modelQuery;
  const meta = await candidateQuery.countTotal();

  return { meta, result };
};

// const getAllCandidates = async (query: Record<string, any> = {}) => {
//   /**
//    * Step 1: Get candidate user IDs
//    */
//   const candidateUsers = await User.find({
//     role: USER_ROLE.CANDIDATE,
//     isDeleted: false,
//     status: 'active',
//   }).select('_id');

//   const candidateUserIds = candidateUsers.map(user => user._id);

//   /**
//    * Step 2: Base filter for candidate profiles
//    */
//   const baseFilter = {
//     userId: { $in: candidateUserIds },
//   };

//   /**
//    * Step 3: QueryBuilder
//    */
//   const candidateQuery = new QueryBuilder(
//     CandidateProfile.find(baseFilter).populate({
//       path: 'userId',
//       select: 'name email phone profileImage role status',
//     }),
//     query,
//   )
//     .search(['name', 'email', 'designation', 'skills', 'location'])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   /**
//    * Step 4: Execute query
//    */
//   const result = await candidateQuery.modelQuery;
//   const meta = await candidateQuery.countTotal();

//   return { meta, result };
// };



export const userService = {
  createUserToken,
  otpVerifyAndCreateUser,
  updateUser,
  updateUserCandidateProfile,
  updateUserStatus,
  getMyProfile,
  getMyCandidateProfile,
  getAllCandidates,
  getAllEmployers
}
