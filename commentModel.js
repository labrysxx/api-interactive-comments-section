const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    author: {
        name: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        }
    },
    body: {
        type: String,
        required: true
    },
    answers: [
        {
            author: {
                name: {
                    type: String,
                    required: true
                },
                image: {
                    type: String
                }
            },
            body: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            },
            image: {
                type: String
            },
            votes: {
                type: Number,
                default: 0
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    },
    meta: {
        votes: {
            type: Number,
            default: 0
        }
    }
});

module.exports = mongoose.model('comment', commentSchema)