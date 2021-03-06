import {
    GraphQLObjectType,
    GraphQLFloat,
    GraphQLID,
    GraphQLString,
    GraphQLEnumType,
} from 'graphql';
import GraphQLISODate from 'graphql-iso-date';

const { GraphQLDate } = GraphQLISODate;

export const FrequencyType = new GraphQLEnumType({
    name: 'Frequency',
    values: {
        DAILY: {value: "DAILY"},
        WEEKLY: {value: "WEEKLY"},
        MONTHLY: {value: "MONTHLY"},
        QUARTERLY: {value: "QUARTERLY"},
        HALFYEARLY: {value: "HALFYEARLY"},
        YEARLY: {value: "YEARLY"},
    }
});

export const CategoryType = new GraphQLEnumType({
    name: 'Category',
    values: {
        CONTENT: {value: "CONTENT"},
        SERVICE: {value: "SERVICE"},
    }
});

const SubscriptionServiceType = new GraphQLObjectType({
    name: 'SubscriptionService',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        billingDate: {type: GraphQLDate},
        cost: {type: GraphQLFloat},
        frequency: {type: FrequencyType},
        category: {type: CategoryType},
        userId: {type: GraphQLString},
    })
})

export default SubscriptionServiceType;