import { z } from 'zod';

export const userSchema = z.object({
	username: z.string().trim().toLowerCase().min(1, { message: 'Username is required' }),
	password: z.string().regex(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$'), {
		message:
			'Password must be at least 8 characters and contain an uppercase letter, lowercase letter, and number'
	})
});

export type UserSchema = z.infer<typeof userSchema>;
