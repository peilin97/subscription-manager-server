import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import mutation from './mutations/adminIndex.js';
import query from './queries/admin.js';

const Schema = new GraphQLSchema({
    query: query,
    mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: mutation,
    })
});

export default Schema;