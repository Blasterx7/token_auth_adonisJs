import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {

    /**
     * Generate a new access token for the user
     * 
     * @param {User} user - The user for whom to generate the token
     * @returns {Promise<{ type: string; value: string }>} - The generated token
     */
    async token(user: User): Promise<{ type: string; value: string }> {
        const token = await User.accessTokens.create(user)

        return {
            type: 'bearer',
            value: token.value!.release(),
        }
    }

    /**
     * Login the user with email and password
     * 
     * @param {HttpContext} ctx - The HTTP context
     * @returns {Promise<{ message: string; user?: User }>} - The login response
     */
    async login({ request }: HttpContext): Promise<{ message: string; user?: User; token?: { type: string; value: string } }> {
        const { email, password } = request.only(['email', 'password'])

        const user = await User.verifyCredentials(email, password)

        console.log(user);

        if (!user) {
            return {
                message: 'Invalid credentials',
            }
        }

        const token = await this.token(user)
        console.log(token);

        return {
            message: 'Login successful',
            user,
            token,
        }
    }
    
    async register({ request } : HttpContext) {
        const { email, password } = request.only(['email', 'password'])

        const user = await User.create({
            email,
            password,
        })

        const token = await this.token(user)

        return {
            message: 'Registration successful',
            user,
            token,
        }
    }
}