import * as z from 'zod';

const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{231A}-\u{231B}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}]/u;

export function hasEmoji(value: string): boolean {
  return emojiRegex.test(value);
}

export const noEmoji = (fieldName: string) =>
  z.string().refine((val) => !hasEmoji(val), {
    message: `${fieldName} cannot contain emojis`,
  });

export const emailField = z
  .string({ required_error: 'Email is required' })
  .email({ message: 'Please enter a valid email address' })
  .refine((val) => !hasEmoji(val), {
    message: 'Email cannot contain emojis',
  });

export const stringField = (fieldName: string, min = 2) =>
  z
    .string({ required_error: `${fieldName} is required` })
    .min(min, { message: `${fieldName} must be at least ${min} characters` })
    .refine((val) => !hasEmoji(val), {
      message: `${fieldName} cannot contain emojis`,
    });

export const phoneField = z
  .string({ required_error: 'Phone number is required' })
  .regex(/^[6-9]\d{9}$/, { message: 'Please enter a valid 10-digit mobile number' })
  .refine((val) => !hasEmoji(val), {
    message: 'Phone number cannot contain emojis',
  });

export const urlField = z
  .string()
  .url({ message: 'Please enter a valid URL' })
  .refine((val) => !hasEmoji(val), {
    message: 'URL cannot contain emojis',
  })
  .optional()
  .or(z.literal(''));

export const optionalStringField = (fieldName: string) =>
  z
    .string()
    .optional()
    .refine((val) => !val || !hasEmoji(val), {
      message: `${fieldName} cannot contain emojis`,
    });

export const passwordField = z
  .string({ required_error: 'Password is required' })
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d|.*[!@#$%^&*(),.?":{}|<>]).*$/,
    'Password must contain an uppercase letter, a lowercase letter, and a number or special character'
  )
  .refine((val) => !hasEmoji(val), {
    message: 'Password cannot contain emojis',
  });
