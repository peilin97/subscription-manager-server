import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Isemail from 'isemail';
import {
    GraphQLString,
    GraphQLNonNull,
    GraphQLBoolean
} from 'graphql';
import UserModel from '../../models/user.js';
import AuthPayloadType from '../customTypes/authpayload.js';
import {
    checkPassword,
} from '../../utils.js';

const signup = {
    type: AuthPayloadType,
    args: {
        email: {type: new GraphQLNonNull(GraphQLString)},
        username: {type: new GraphQLNonNull(GraphQLString)},
        password: {type: new GraphQLNonNull(GraphQLString)},
    },
    resolve: async function (parent, {email, username, password}, context) {
        const { response } = context;
        if (await UserModel.exists({email: email})) {
            throw new Error('Email address already exists');
        }
        if (!Isemail.validate(email)) {
            throw new Error('Invalid Email');
        }
        const result = checkPassword(password);
        if (!result.isValid) {
            throw new Error(result.message);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserModel.create({
            email: email,
            password: hashedPassword,
            username: username
        });
        const token = jwt.sign(
            {userId: user.id},
            process.env.APP_SECRET,
            {expiresIn: '30d'},
            );
        response.cookie('token', token, {httpOnly: true});
        // console.log(cookie);
        return {
            token,
            user,
        };
    }
}

const login = {
    type: AuthPayloadType,
    args: {
        email: {type: new GraphQLNonNull(GraphQLString)},
        password: {type: new GraphQLNonNull(GraphQLString)},
    },
    resolve: async function (parent, {email, password}, context) {
        const { response } = context;
        // console.log(req.cookies);
        // console.log("context.req: " + context.req.cookies);
        const user = await UserModel.findOne({email: email});
        if (!user) {
            throw new Error('No such user found');
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new Error('Invalid password');
        }
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
        response.cookie('token', token, {httpOnly: true});
        // console.log("user: "+ user);
        // return user;
        return {
            token,
            user,
        };
    }
}

const editProfile = {
    type: AuthPayloadType,
    args: {
        id: {type: GraphQLString},  // this user's id
        email: {type: new GraphQLNonNull(GraphQLString)},
        username: {type: new GraphQLNonNull(GraphQLString)},
        password: {type: new GraphQLNonNull(GraphQLString)},
    },
    resolve: async function (parent, {id, email, username, password}, context) {
        const { userId } = context;
        const oldUser = await UserModel.findById(userId);
        if (userId  !== id) {
            throw new Error("inconsistent id")
        }
        // check the validity of email
        if (oldUser.email !== email
            && await UserModel.exists({email: email})) {
            throw new Error('Email address already exists');
        }
        if (!Isemail.validate(email)) {
            throw new Error('Invalid Email');
        }
        // check password
        const result = checkPassword(password);
        if (!result.isValid) {
            throw new Error(result.message);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserModel.findByIdAndUpdate(
            id,
            {
                email: email,
                password: hashedPassword,
                username: username
            },
            {new: true}
        );
        const token = jwt.sign({userId: user.id}, process.env.APP_SECRET);
        response.cookie('token', token, {httpOnly: true});
        return {
            token,
            user,
        };
    }
}

const logout = {
    type: GraphQLBoolean,
    args: {},
    async resolve(_, __, context) {
        const { response } = context;
        // const user = await UserModel.findById(userId);
        // request.logout();
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
    signup,
    login,
    logout,
    editProfile,
};