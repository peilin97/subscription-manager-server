import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Isemail from 'isemail';
import {
    GraphQLString,
    GraphQLNonNull,
    GraphQLBoolean,
} from 'graphql';
import UserModel from '../../models/user.js';
import AdministratorModel from '../../models/administrator.js';
import AdministratorType from '../customTypes/administrator.js';
import UserType from '../customTypes/user.js';
import {
    checkPassword,
} from '../../utils.js';

const signup = {
    type: AdministratorType,
    args: {
        email: {type: new GraphQLNonNull(GraphQLString)},
        username: {type: new GraphQLNonNull(GraphQLString)},
        password: {type: new GraphQLNonNull(GraphQLString)},
        invitationCode: {type: new GraphQLNonNull(GraphQLString)},
    },
    resolve: async function (_, {email, username, password, invitationCode}, context) {
        const { response } = context;
        if (await AdministratorModel.exists({email: email})) {
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
        console.log(invitationCode);
        console.log(process.env.ADMINISTRATOR_SECRET);
        if (invitationCode !== process.env.ADMINISTRATOR_SECRET) {
            throw new Error('Invalid invitation code');
        }
        const administrator = await AdministratorModel.create({
            email: email,
            password: hashedPassword,
            username: username
        });
        const token = jwt.sign (
            {administratorId: administrator.id},
            process.env.APP_SECRET,
            {expiresIn: '30d'},
        );
        response.cookie('token', token, {httpOnly: true});
        return administrator;
    }
}

const login = {
    type: AdministratorType,
    args: {
        email: {type: new GraphQLNonNull(GraphQLString)},
        password: {type: new GraphQLNonNull(GraphQLString)},
    },
    resolve: async function (_, {email, password}, context) {
        const { response } = context;
        const administrator = await AdministratorModel.findOne({email: email});
        if (!administrator) {
            throw new Error('No such user found');
        }
        const valid = await bcrypt.compare(password, administrator.password);
        if (!valid) {
            throw new Error('Invalid password');
        }
        const token = jwt.sign (
            {administratorId: administrator.id},
            process.env.APP_SECRET,
            {expiresIn: '30d'},
        );
        response.cookie('token', token, {httpOnly: true});
        return administrator;
    }
}

// search a user by email
const findUser = {
    type: UserType,
    args: {
        userEmail: {type: new GraphQLNonNull(GraphQLString)},
    },
    resolve: async function(_, { userEmail }, context) {
        const { adminId } = context;
        if ( !adminId ) {
            throw new Error("Invalid request");
        }
        const user = await UserModel.findOne({email: userEmail});
        if (!user) {
            throw new Error('No such user found');
        }
        return user;
    }
}

const deleteUser = {
    type: GraphQLBoolean,
    args: {
        userEmail: {type: new GraphQLNonNull(GraphQLString)},
    },
    resolve: async function(_, { userEmail }, context) {
        const { adminId } = context;
        if ( !adminId ) {
            throw new Error("Invalid request");
        }
        const user = await UserModel.findOneAndDelete({email: userEmail});
        return user ? true : false;
    }
}

export {
    signup,
    login,
    findUser,
    deleteUser,
};