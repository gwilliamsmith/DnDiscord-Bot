const mongoose = require('mongoose')
const itemSchema = require('./itemSchema')

const reqString = {
    type: String,
	required: true
}

const goldSchema = mongoose.Schema({
    owner: reqString,
    server_id: reqString,
    platinum: Number,
    gold: Number,
    silver: Number,
    copper: Number
})

goldSchema.index({owner: 1, server_id: 1}, {unique: true})

module.exports = mongoose.model('gold', goldSchema)