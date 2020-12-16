// mutations for cover
import {
    GraphQLString,
} from 'graphql';
import UserModel from '../../models/user.js';
import UserType from '../customTypes/user.js';

const addCover = {
    type: UserType,
    args: {
        cover: {type: GraphQLString}
    },
    resolve: async function (_, {cover}, context) {
        const { userId } = context;
        // update subscriptions' billing date if necessary before return
        const user = await UserModel.findByIdAndUpdate(
            userId,
            { cover: cover },
            {new: true}
        );
        
        return user;
    }
}

const removeCover = {
    type: UserType,
    resolve: async function (_, __, context) {
        const { userId } = context;
        // update subscriptions' billing date if necessary before return
        const user = await UserModel.findByIdAndUpdate(
            userId,
            { cover: '' },
            {new: true}
        );
        
        return user;
    }
}

export {
    addCover,
    removeCover,
};