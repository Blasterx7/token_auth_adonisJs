import User from '#models/user';
import { registerValidator } from '#validators/user';
export default class AuthController {
    async token(user) {
        const token = await User.accessTokens.create(user);
        return {
            type: 'bearer',
            value: token.value.release(),
        };
    }
    async login({ auth, request }) {
        await auth.check();
        if (auth.isAuthenticated) {
            return {
                message: 'Already logged in',
                user: auth.user,
            };
        }
        const { email, password } = request.only(['email', 'password']);
        const user = await User.verifyCredentials(email, password);
        if (!user) {
            return {
                message: 'Invalid credentials',
            };
        }
        const token = await this.token(user);
        return {
            message: 'Login successful',
            user,
            token,
        };
    }
    async register({ request }) {
        try {
            await request.validateUsing(registerValidator);
            const { email, password } = request.only(['email', 'password']);
            const user = await User.create({
                email,
                password,
            });
            const token = await this.token(user);
            return {
                message: 'Registration successful',
                user,
                token,
            };
        }
        catch (error) {
            return {
                message: 'Registration failed',
                error: error.messages,
            };
        }
    }
}
//# sourceMappingURL=auth_controller.js.map