import { RegisterRequestBody } from '~/models/requests/User.request'
import Users from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'


class UsersService {
	async register(payload: RegisterRequestBody) {
		const { email, password } = payload
		const result = await databaseService.users.insertOne(new Users({
			...payload,
			date_of_birth: new Date(payload.date_of_birth),
			password: hashPassword(password),
		}))

		return result
	}

	async checkEmailExists(email: string) {
		const user = await databaseService.users.findOne({ email })
		return user
	}
}

const usersService = new UsersService()
export default usersService