// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import Isemail from 'isemail';
import {
    GraphQLFloat,
    GraphQLString,
    GraphQLNonNull
} from 'graphql';
import UserModel from '../../models/user.js';
import SubscriptionModel from '../../models/subscription.js';
import UserType from '../customTypes/user.js';
import SubscriptionServiceType, {
    FrequencyType,
    CategoryType,
} from '../customTypes/subscription.js';
import { GraphQLDate } from 'graphql-iso-date';
import {
    // checkPassword,
    updateBillingDate,
} from '../../utils.js';

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

export {
    getUser,
    postSubscriptionToUser,
    editSubscriptionToUser,
    deleteSubscriptionToUser,
    createSubscription,
};