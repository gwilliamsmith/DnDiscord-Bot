const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const inventorySchema = mongoose.Schema({
    itemName: reqString,
    server_id: reqString,
    owner: reqString,
    quantity: {type: Number, required: true}
})

inventorySchema.index({itemName: 1, server_id: 1, owner: 1}, {unique: true})

module.exports = mongoose.model('inventory', inventorySchema)