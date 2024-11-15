const mongoose = require('mongoose');

const humanitarianActionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    actionDate: {
        type: Date,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Référence à la collection User
    }],
    donations: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        amount: {
            type: Number,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const HumanitarianAction = mongoose.model('HumanitarianAction', humanitarianActionSchema);
module.exports = HumanitarianAction;
