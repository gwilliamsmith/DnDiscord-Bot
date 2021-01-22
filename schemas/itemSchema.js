const mongoose = require('mongoose')

const reqString = {
	type: String,
	required: true
}

const itemSchema = mongoose.Schema({
	name: reqString,
	server_id: reqString,
	party: Boolean,
	owner: reqString,
	quantity: String,
	description: String
})

itemSchema.index({ name: 1,	server_id: 1}, { unique: true})

module.exports = mongoose.model('Inventory', itemSchema)