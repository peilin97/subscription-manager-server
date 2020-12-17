import mongoose from 'mongoose';
import {
    GraphQLObjectType,
    GraphQLList,
    GraphQLID,
    GraphQLString,
    GraphQLNonNull
} from 'graphql';
import SubscriptionServiceType from './subscription.js';
import SubscriptionModel from '../../models/subscription.js';

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLID)},
        username: {type: new GraphQLNonNull(GraphQLString)},
        email: {type: new GraphQLNonNull(GraphQLString)},
        password: {type: new GraphQLNonNull(GraphQLString)},
        cover: {type: GraphQLString},
        subscriptionsId: {type: new GraphQLList(GraphQLString)},
        subscriptions:{
            type: new GraphQLList(SubscriptionServiceType),
            resolve(user) {
                return (user.subscriptionsId.length === 0) ? []
                : user.subscriptionsId.map(async (id) => {
                    const res = await SubscriptionModel.findById(mongoose.Types.ObjectId(id));
                    return res;
                })
            }
        }
    })
})

export default UserType;
