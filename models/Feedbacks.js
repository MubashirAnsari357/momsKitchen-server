import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
    dish:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dish',
    },
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    rating:{
        type: Number,
        required: true
    },
    feedbackDesc:{
        type: String,
    },
}, {timestamps: true})

export const Feedback = mongoose.model('feedback', FeedbackSchema) 