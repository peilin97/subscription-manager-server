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
            description: 'get the administrator',
            args: {},
            resolve: async function (_, __, context) {
                const { adminId } = context;
                if (!adminId) {
                    throw new Error('You must log in first.');
                }
                const administrator = await AdministratorModel.findById(adminId);
                return administrator;
            }
        },
    })
});

export default Query;