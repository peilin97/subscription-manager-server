import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Isemail from 'isemail';
import {
    GraphQLString,
    GraphQLNonNull,
} from 'graphql';
import UserModel from '../../models/user.js';
import UserType from '../customTypes/user.js';
import {
    checkPassword,
} from '../../utils.js';

const signup = {
    type: UserType,
    args: {
        email: {type: new GraphQLNonNull(GraphQLString)},
        username: {type: new GraphQLNonNull(GraphQLString)},
        password: {type: new GraphQLNonNull(GraphQLString)},
    },
    resolve: async function (_, {email, username, password}, context) {
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
            username: username,
            subscriptionsId: [],
        });
        const token = jwt.sign(
            {userId: user.id},
            process.env.APP_SECRET,
            {expiresIn: '30d'},
        );
        response.cookie('token', token, {httpOnly: true});
        return user;
    }
}

const login = {
    type: UserType,
    args: {
        email: {type: new GraphQLNonNull(GraphQLString)},
        password: {type: new GraphQLNonNull(GraphQLString)},
    },
    resolve: async function (_, {email, password}, context) {
        const { response } = context;
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
        return user;
    }
}

const editProfile = {
    type: UserType,
    args: {
        email: {type: new GraphQLNonNull(GraphQLString)},
        username: {type: new GraphQLNonNull(GraphQLString)},
    },
    resolve: async function (_, { email, username}, context) {
        const { userId, response } = context;
        const oldUser = await UserModel.findById(userId);
        // check the validity of email
        if (oldUser.email !== email
            && await UserModel.exists({email: email})) {
            throw new Error('Email address already exists');
        }
        if (!Isemail.validate(email)) {
            throw new Error('Invalid Email');
        }
        const user = await UserModel.findByIdAndUpdate(
            userId,
            {
                email: email,
                username: username
            },
            {new: true}
        );
        const token = jwt.sign({userId: userId}, process.env.APP_SECRET);
        response.cookie('token', token, {httpOnly: true});
        return user;
    }
}

const changePassword = {
    type: UserType,
    args: {
        password: {type: new GraphQLNonNull(GraphQLString)},
    },
    resolve: async function(_, {password}, context) {
        const { userId, response } = context;
        const oldUser = await UserModel.findById(userId);
        const result = checkPassword(password);
        if (!result.isValid) {
            throw new Error(result.message);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserModel.findByIdAndUpdate(
            userId,
            { password: hashedPassword },
            {new: true}
        );
        const token = jwt.sign({userId: userId}, process.env.APP_SECRET);
        response.cookie('token', token, {httpOnly: true});
        return user;
    }
}

export {
    signup,
    login,
    editProfile,
    changePassword,
};