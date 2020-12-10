import mongoose from 'mongoose';
import {
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';
import UserModel from '../models/user.js';
import UserType from './user.js';
import SubscriptionModel from '../models/subscription.js';
import SubscriptionServiceType from './subscription.js';

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        user: {
            type: UserType,
            description: "get the user by email WITH TOKEN",
            args: {
                // `args` describes the arguments that the `user` query accepts
                email: {type: GraphQLString},
            },
            resolve: async function (parent, args, context) {
                const { userId } = context;
                const findUser = await UserModel.findOne({email: args.email});
                if (findUser.id !== userId) {
                    console.log(findUser.id);
                    console.log(userId);
                    throw new Error("No right to check other user's information");
                }
                return findUser;
            }
        },
        subscriptionService: {
            type: SubscriptionServiceType,
            description: "get a subscription by its id for its user",
            args: {
                id: {type: GraphQLString}
            },
            resolve: async function (parent, { id }, context) {
                const { userId } = context;
                const findSub = await SubscriptionModel.findById(mongoose.Types.ObjectId(id));
                if (!findSub) {
                    throw new Error('Invalid subscription service id');
                }
                if (findSub.userId !== userId) {
                    throw new Error("No right to read other users' subscription");
                }
                return findSub;
            }
        }
    })
});

export default Query;