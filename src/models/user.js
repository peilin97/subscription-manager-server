import mongoose from 'mongoose';
// const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    email: {type: String, unique: true, required: true},
    username: {type: String, required: true},
    password: {type: String, required: true},
    createdOn: {type: Date, default: Date.now()},
    subscriptionsId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription"
    }]
})

// UserSchema.plugin(passportLocalMongoose)
export default mongoose.model('User', UserSchema);