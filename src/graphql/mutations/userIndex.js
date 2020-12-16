import {
    signup,
    login,
    editProfile,
    changePassword,
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
    changePassword,
    getUser,
    postSubscriptionToUser,
    editSubscriptionToUser,
    deleteSubscriptionToUser,
    createSubscription,
};