import mongoose from 'mongoose';
import {
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';
import UserModel from '../../models/user.js';
import UserType from '../customTypes/user.js';
import SubscriptionModel from '../../models/subscription.js';
import SubscriptionServiceType from '../customTypes/subscription.js';

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        user: {
            type: UserType,
            description: 'get the user by HTTP Headers {"Authorization": "Bearer TOKEN"}',
            args: {},
            resolve: async function (_, __, context) {
                const { userId } = context;
                const user = await UserModel.findById(userId);
                // if (user.id !== userId) {
                //     console.log(user.id);
                //     console.log(userId);
                //     throw new Error("No right to check other user's information");
                // }
                return user;
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
                const subscriptionService = await SubscriptionModel.findById(mongoose.Types.ObjectId(id));
                if (!subscriptionService) {
                    throw new Error('Invalid subscription service id');
                }
                if (subscriptionService.userId !== userId) {
                    throw new Error("No right to read other users' subscription");
                }
                return subscriptionService;
            }
        }
    })
});

export default Query;