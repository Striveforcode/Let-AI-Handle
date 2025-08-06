import { initContract } from "@ts-rest/core";
import { z } from "zod";

const c = initContract();

// Base response schema
const baseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Registration request schemas
const registerInitReqSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
});

const registerVerifyReqSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

const resendOtpReqSchema = z.object({
  email: z.string().email(),
});

// Registration response schemas
const registerInitResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    email: z.string(),
    expiresIn: z.number(), // OTP expiration time in seconds
  }),
});

const registerVerifyResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    user: z.object({
      _id: z.string(),
      email: z.string(),
      name: z.string(),
      phone: z.string().optional(),
      isVerified: z.boolean(),
      createdAt: z.string(),
    }),
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
});

// Login request schemas
const loginInitReqSchema = z.object({
  email: z.string().email(),
});

const loginVerifyReqSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

// Login response schemas
const loginVerifyResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    user: z.object({
      _id: z.string(),
      email: z.string(),
      name: z.string(),
      phone: z.string().optional(),
      isVerified: z.boolean(),
    }),
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
});

// Token refresh schema
const refreshTokenReqSchema = z.object({
  refreshToken: z.string(),
});

const refreshTokenResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
});

// Logout schema
const logoutReqSchema = z.object({
  refreshToken: z.string(),
});

// Export types
export type RegisterInitDto = z.infer<typeof registerInitReqSchema>;
export type RegisterVerifyDto = z.infer<typeof registerVerifyReqSchema>;
export type ResendOtpDto = z.infer<typeof resendOtpReqSchema>;
export type LoginInitDto = z.infer<typeof loginInitReqSchema>;
export type LoginVerifyDto = z.infer<typeof loginVerifyReqSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenReqSchema>;
export type LogoutDto = z.infer<typeof logoutReqSchema>;

export const AuthContract = c.router({
  // Registration endpoints
  registerInit: {
    method: "POST",
    path: "/auth/register/init",
    body: registerInitReqSchema,
    responses: {
      200: registerInitResponseSchema,
      400: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Initialize registration by sending OTP",
  },
  registerVerify: {
    method: "POST",
    path: "/auth/register/verify",
    body: registerVerifyReqSchema,
    responses: {
      200: registerVerifyResponseSchema,
      400: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Verify OTP and complete registration",
  },
  resendOtp: {
    method: "POST",
    path: "/auth/register/resend",
    body: resendOtpReqSchema,
    responses: {
      200: registerInitResponseSchema,
      400: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Resend OTP for registration",
  },

  // Login endpoints
  loginInit: {
    method: "POST",
    path: "/auth/login/init",
    body: loginInitReqSchema,
    responses: {
      200: registerInitResponseSchema,
      400: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Initialize login by sending OTP",
  },
  loginVerify: {
    method: "POST",
    path: "/auth/login/verify",
    body: loginVerifyReqSchema,
    responses: {
      200: loginVerifyResponseSchema,
      400: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Verify OTP and complete login",
  },

  // Token management
  refreshToken: {
    method: "POST",
    path: "/auth/token/refresh",
    body: refreshTokenReqSchema,
    responses: {
      200: refreshTokenResponseSchema,
      400: baseResponseSchema,
      401: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Refresh access token using refresh token",
  },
  logout: {
    method: "POST",
    path: "/auth/logout",
    body: logoutReqSchema,
    responses: {
      200: baseResponseSchema,
      400: baseResponseSchema,
      500: baseResponseSchema,
    },
    summary: "Logout user and invalidate tokens",
  },
});
