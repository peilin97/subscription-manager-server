import mongoose from 'mongoose';
import Double from '@mongoosejs/double';

const SubscriptionSchema = new mongoose.Schema({
    name: String,
    billingDate: Date,
    frequency: {
        type: String,
        enum: [
            'DAILY',
            'WEEKLY',
            'MONTHLY',
            'QUARTERLY',
            'HALFYEARLY',
            'YEARLY']
    },
    cost: Double,
    category: {
        type: String,
        enum: ['CONTENT', 'SERVICE']
    },
    userId: mongoose.Schema.Types.ObjectId,
});

export default mongoose.model("Subscription", SubscriptionSchema);