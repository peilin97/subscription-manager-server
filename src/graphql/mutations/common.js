import jwt from 'jsonwebtoken';
import {
    GraphQLBoolean
} from 'graphql';

const logout = {
    type: GraphQLBoolean,
    args: {},
    async resolve(_, __, context) {
        const { response } = context;
        // https://stackoverflow.com/q/12825669/14271877
        jwt.sign(
            {},
            process.env.APP_SECRET,
            {expiresIn: '0'}
        );
        response.cookie('token', '', {httpOnly: true});
        return true;
    }
}

export {
    logout,
};