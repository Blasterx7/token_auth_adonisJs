import User from '#models/user'
import { registerValidator } from '#validators/user';
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

    async login({ auth, request }: HttpContext) {
        // Check if the user is already authenticated
        await auth.check()

        // Check if the user is already authenticated
        if (auth.isAuthenticated) {
            return {
                message: 'Already logged in',
                user: auth.user,
            }
        }

        const { email, password } = request.only(['email', 'password'])

        const user = await User.verifyCredentials(email, password)

        if (!user) {
            return {
                message: 'Invalid credentials',
            }
        }

        const token = await this.token(user)

        return {
            message: 'Login successful',
            user,
            token,
        }
    }

    async register({ request }: HttpContext) {
        try {
            await request.validateUsing(registerValidator);

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
        } catch (error) {
            return {
                message: 'Registration failed',
                error: error.messages,
            }
        }
    }
}