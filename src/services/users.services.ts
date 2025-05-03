import { TokenType, UserVerifyStatus } from '~/constants/enum';
import { RegisterRequestBody } from '~/models/requests/User.request'
import Users from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt';
import ms from 'ms'
import RefreshToken from '~/models/schemas/RefreshToken.schema';
import { ObjectId } from 'mongodb';
import { config } from 'dotenv';
import { USERS_MESSAGE } from '~/constants/messages';
config();

class UsersService {
	private signAccessToken(user_id: string) {
		return signToken({
			payload: {
				user_id,
				token_type: TokenType.AccessToken
			},
			privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
			options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES as ms.StringValue }
		});
	}

	private signRefreshToken(user_id: string) {
		return signToken({
			payload: {
				user_id,
				token_type: TokenType.RefreshToken
			},
			privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
			options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES as ms.StringValue }
		});
	}

	private signAccessAndRefreshTokens(user_id: string) {
		return Promise.all([
			this.signAccessToken(user_id),
			this.signRefreshToken(user_id)
		])
	}

	private signEmailVerifyToken(user_id: string) {
		return signToken({
			payload: {
				user_id,
				token_type: TokenType.EmailVerifyToken
			},
			privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
			options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES as ms.StringValue }
		});
	}

	async register(payload: RegisterRequestBody) {
		const user_id = new ObjectId();
		const email_verify_token = await this.signEmailVerifyToken(user_id.toString());

		await databaseService.users.insertOne(new Users({
			...payload,
			_id: user_id,
			email_verify_token,
			date_of_birth: new Date(payload.date_of_birth),
			password: hashPassword(payload.password),
		}))

		const [access_token, refresh_token] = await this.signAccessAndRefreshTokens(user_id.toString());
		await databaseService.refreshTokens.insertOne(new RefreshToken({user_id: user_id, token: refresh_token}));

		console.log('email_verify_token', email_verify_token);
		return { access_token, refresh_token }
	}

	async checkEmailExists(email: string) {
		const user = await databaseService.users.findOne({ email })
		return user
	}

	async login(user_id: string) {
		const [access_token, refresh_token] = await this.signAccessAndRefreshTokens(user_id);
		await databaseService.refreshTokens.insertOne(new RefreshToken({user_id: new ObjectId(user_id), token: refresh_token}));

		return { access_token, refresh_token }
	}

	async logout(refresh_token: string) {
		await databaseService.refreshTokens.deleteOne({ token: refresh_token });
		return {
			message: USERS_MESSAGE.LOGOUT_SUCCESS,
		}
	}

	async verifyEmail(user_id: string) {
		const [tokens] = await Promise.all([
			this.signAccessAndRefreshTokens(user_id),
			databaseService.users.updateOne(
				{ _id: new ObjectId(user_id) }, 
				{ $set: { 
					email_verify_token: '',
					updated_at: new Date(),
					verify: UserVerifyStatus.Verified
				} 
			}),
		]);

		const [access_token, refresh_token] = tokens;

		return { access_token, refresh_token };
	}
}

const usersService = new UsersService()
export default usersService