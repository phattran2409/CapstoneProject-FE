import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { OTPRequest, VerifyOTPRequest } from '../types/auth.types';

/**
 * Hook to send OTP to phone number
 * 
 * @example
 * const { mutate: sendOTP, isPending } = useSendOTP();
 * 
 * sendOTP(
 *   { phone: '+84909123456' },
 *   {
 *     onSuccess: (response) => {
 *       Alert.alert('Success', response.message);
 *       // For testing: console.log('OTP:', response.debug_otp);
 *     },
 *   }
 * );
 */
export const useSendOTP = () => {
  return useMutation({
    mutationFn: (request: OTPRequest) => authApi.sendOTP(request),
  });
};

/**
 * Hook to verify OTP
 * 
 * @example
 * const { mutate: verifyOTP, isPending, error } = useVerifyOTP();
 * 
 * verifyOTP(
 *   { phone: '+84909123456', otp: '123456' },
 *   {
 *     onSuccess: () => navigation.navigate('NextScreen'),
 *     onError: (error) => Alert.alert('Error', 'Invalid OTP'),
 *   }
 * );
 */
export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: (request: VerifyOTPRequest) => authApi.verifyOTP(request),
  });
};

