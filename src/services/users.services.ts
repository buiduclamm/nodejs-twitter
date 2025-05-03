import { TokenType } from '~/constants/enum';
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
			options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES as ms.StringValue }
		});
	}

	private signRefreshToken(user_id: string) {
		return signToken({
			payload: {
				user_id,
				token_type: TokenType.RefreshToken
			},
			options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES as ms.StringValue }
		});
	}

	private signAccessAndRefreshTokens(user_id: string) {
		return Promise.all([
			this.signAccessToken(user_id),
			this.signRefreshToken(user_id)
		])
	}

	async register(payload: RegisterRequestBody) {
		const result = await databaseService.users.insertOne(new Users({
			...payload,
			date_of_birth: new Date(payload.date_of_birth),
			password: hashPassword(payload.password),
		}))

		const user_id = result.insertedId.toString()
		const [access_token, refresh_token] = await this.signAccessAndRefreshTokens(user_id);

		await databaseService.refreshTokens.insertOne(new RefreshToken({user_id: new ObjectId(user_id), token: refresh_token}));

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
}

const usersService = new UsersService()
export default usersService