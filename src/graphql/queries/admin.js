import {
    GraphQLObjectType,
} from 'graphql';
import AdministratorModel from '../../models/administrator.js';
import AdministratorType from '../customTypes/administrator.js';

const Query = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        administrator: {
            type: AdministratorType,
            description: 'get the administrator by HTTP Headers {"Authorization": "Bearer TOKEN"}',
            args: {},
            resolve: async function (_, __, context) {
                const { adminId } = context;
                const administrator = await AdministratorModel.findById(adminId);
                return administrator;
            }
        },
    })
});

export default Query;