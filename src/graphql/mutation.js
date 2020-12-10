import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Isemail from 'isemail';
import {
    GraphQLFloat,
    GraphQLString,
    GraphQLNonNull
} from 'graphql';
import UserModel from '../models/user.js';
import SubscriptionModel from '../models/subscription.js';
import UserType from './user.js';
import AuthPayloadType from './authpayload.js';
import {APP_SECRET} from '../utils.js';
import SubscriptionServiceType, {
    FrequencyType,
    CategoryType,
} from './subscription.js';
import { GraphQLDate } from 'graphql-iso-date';
import {
    checkPassword,
    updateBillingDate,
} from '../utils.js';

const signup = {
    type: AuthPayloadType,
    args: {
        email: {type: new GraphQLNonNull(GraphQLString)},
        username: {type: new GraphQLNonNull(GraphQLString)},
        password: {type: new GraphQLNonNull(GraphQLString)},
    },
    resolve: async function (parent, {email, username, password}) {
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
        const token = jwt.sign({userId: user.id}, APP_SECRET);
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
    resolve: async function (parent, {email, password}) {
        const user = await UserModel.findOne({email: email});
        if (!user) {
            throw new Error('No such user found');
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new Error('Invalid password');
        }
        const token = jwt.sign({ userId: user.id }, APP_SECRET);
        console.log("user: "+ user);
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
        const token = jwt.sign({userId: user.id}, APP_SECRET);
        return {
            token,
            user,
        };
    }
}

const getUser = {
    type: UserType,
    resolve: async function (parent, args, context) {
        const { userId } = context;
        // update subscriptions' billing date if necessary before return
        const user = await UserModel.findById(userId);
        const subscriptionsId = user.subscriptionsId;
        for (let subId of subscriptionsId) {
            const sub = await SubscriptionModel.findById(subId);
            // console.log(sub.billingDate)
            if (sub.billingDate < Date.now()) {
                // update the billing date
                const newBillingDate = updateBillingDate(sub.billingDate, sub.frequency);
                await SubscriptionModel.findByIdAndUpdate(
                    subId,
                    { billingDate: newBillingDate },
                    {new: true}
                );
            }
        }
        return user;
    }
}

const postSubscriptionToUser = {
    type: UserType,
    args: {
        name: {type: new GraphQLNonNull(GraphQLString)},
        billingDate: {type: GraphQLDate},
        cost: {type: new GraphQLNonNull(GraphQLFloat)},
        frequency: {type: new GraphQLNonNull(FrequencyType)},
        category: {type: new GraphQLNonNull(CategoryType)},
    },
    resolve: async function(parent, args, context) {
        const { userId } = context;
        const newSubscription = await SubscriptionModel.create({
            name: args.name,
            billingDate: args.billingDate,
            cost: args.cost,
            category: args.category,
            frequency: args.frequency,
            userId: userId
        });
        const user = await UserModel.findByIdAndUpdate(
            userId,
            { $push: {subscriptionsId: newSubscription.id } },
            {new: true},
        );
        return user;
    }
}

const editSubscriptionToUser = {
    type: UserType,
    args: {
        id: {type: GraphQLString},  // this subscription's id
        name: {type: new GraphQLNonNull(GraphQLString)},  // new or unchanged name
        billingDate: {type: GraphQLDate},
        cost: {type: new GraphQLNonNull(GraphQLFloat)},
        frequency: {type: new GraphQLNonNull(FrequencyType)},
        category: {type: new GraphQLNonNull(CategoryType)},
    },
    resolve: async function(parent, args, context) {
        const { userId } = context;
        await SubscriptionModel.findByIdAndUpdate(
            args.id,
            {
                name: args.name,
                billingDate: args.billingDate,
                cost: args.cost,
                category: args.category,
                frequency: args.frequency,
            },
            {new: true}
        )
        const user = await UserModel.findById(userId);
        return user;
    }
}

const deleteSubscriptionToUser = {
    type: UserType,
    args: {
        id: {type: GraphQLString},  // this subscription's id
    },
    resolve: async function(parent, { id }, context) {
        const { userId } = context;
        await SubscriptionModel.findByIdAndDelete(id);
        try {
            const user = await UserModel.findByIdAndUpdate(
                userId,
                { $pull: {subscriptionsId: id } },
                {new: true}
            );
            console.log(user);
            return user;
        } catch (err) {
            console.error(`Something went wrong: ${err}`);
        }
    }
}

const createSubscription = {
    type: SubscriptionServiceType,
    args: {
        name: {type: new GraphQLNonNull(GraphQLString)},
        billingDate: {type: GraphQLDate},
        cost: {type: new GraphQLNonNull(GraphQLFloat)},
        frequency: {type: new GraphQLNonNull(FrequencyType)},
        category: {type: new GraphQLNonNull(CategoryType)},
    },
    resolve: async function(parent, args) {
        const newSubscription = {
            name: args.name,
            billingDate: args.billingDate,
            cost: args.cost,
            category: args.category,
            frequency: args.frequency,
        };
        return newSubscription;
    }
}

export default {
    signup,
    login,
    editProfile,
    getUser,
    postSubscriptionToUser,
    editSubscriptionToUser,
    deleteSubscriptionToUser,
    createSubscription,
};