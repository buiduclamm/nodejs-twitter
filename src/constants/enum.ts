export enum UserVerifyStatus {
	Unverified, // Not verified email yet, default value = 0
	Verified, // Verified email, value = 1
	Banned, // Banned user, value = 2
}

export enum TokenType {
	AccessToken,
	RefreshToken,
	ForgotPasswordToken,
	EmailVerificationToken
}