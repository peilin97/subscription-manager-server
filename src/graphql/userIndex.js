import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import mutation from './mutations/userIndex.js';
import query from './queries/user.js';

const Schema = new GraphQLSchema({
    query: query,
    mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: mutation,
    })
});

export default Schema;