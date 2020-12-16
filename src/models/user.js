import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {type: String, unique: true, required: true},
    username: {type: String, required: true},
    password: {type: String, required: true},
    createdOn: {type: Date, default: Date.now()},
    cover: {type: String},
    subscriptionsId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription"
    }]
})

export default mongoose.model('User', UserSchema);