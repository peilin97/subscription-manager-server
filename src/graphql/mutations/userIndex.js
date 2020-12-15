import {
    signup,
    login,
    // logout,
    editProfile,
} from './auth.js';
import {
    getUser,
    postSubscriptionToUser,
    editSubscriptionToUser,
    deleteSubscriptionToUser,
    createSubscription,
} from './user.js';
import { logout } from './common.js'

export default {
    signup,
    login,
    logout,
    editProfile,
    getUser,
    postSubscriptionToUser,
    editSubscriptionToUser,
    deleteSubscriptionToUser,
    createSubscription,
};