import mongoose from 'mongoose';

const AdministratorSchema = new mongoose.Schema({
    email: {type: String, unique: true, required: true},
    username: {type: String, required: true},
    password: {type: String, required: true},
    createdOn: {type: Date, default: Date.now()},
})

export default mongoose.model('Administrator', AdministratorSchema);