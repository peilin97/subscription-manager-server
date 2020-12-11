import {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLNonNull
} from 'graphql';

const AdministratorType = new GraphQLObjectType({
    name: 'Administrator',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLID)},
        username: {type: new GraphQLNonNull(GraphQLString)},
        email: {type: new GraphQLNonNull(GraphQLString)},
        password: {type: new GraphQLNonNull(GraphQLString)},
    })
})

export default AdministratorType;