import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull
} from 'graphql';
import UserType from './user.js';

const AuthPayloadType = new GraphQLObjectType({
    name: 'AuthPayload',
    fields: () => ({
        token: {type: new GraphQLNonNull(GraphQLString)},
        user: {type: new GraphQLNonNull(UserType)},
    })
})

export default AuthPayloadType;