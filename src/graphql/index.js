import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import mutation from './mutation.js';
import query from './query.js';

const Schema = new GraphQLSchema({
    query: query,
    mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: mutation,
    })
});

export default Schema;