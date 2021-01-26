const mongo = require('../mongo')
const itemSchema = require('../schemas/itemSchema')
const inventorySchema = require('../schemas/inventorySchema')
const { prefix } = require('../config.json')
const { Mongoose } = require('mongoose')

module.exports = {
	name: 'takeItem',
	description: 'takes an item from a player or party inventory, and removes the entry if they no longer have any',
	minArgs: 1,
    maxArgs: 3,
    dbCommand: true,
    expectedArgs: ['[<name>]', '(optional) [ <@user> OR <quantity> ]', '(optional) [<quantity>]'],
    permissionRequired: true,
    requiredRoles: ['DM'],
	execute(message, args) {
		run(message, args)
    },
}

async function run(message, args){
    await mongo().then(async (mongoose) => {
        try{
            var change = 1
            var target = 'party'
            //First check to see if the item exists for the server
            const checkServer = await itemSchema.exists({name: args[0], server_id: message.guild.id})
            if(!checkServer){
                message.reply(` that item does not exist here.`)
                return
            }

            //If a user is mentioned, grab their id to use as the owner field
            if(message.mentions.members.first()){
                target = message.mentions.members.first().id
            }

            //Now check to see if the player or party has the item. If not, complain and exit out
            const checkTarget = await inventorySchema.exists({itemName : args[0], server_id: message.guild.id})
            if(!checkTarget){
                message.reply(` ${target} does not have any ${args[0]}`)
                return
            }

            //If only two args were given, check to see if args[1] is a number
            if(args.length === 2){
                console.log(parseInt(args[1]))
                if(!isNaN(parseInt(args[1]))){
                    change = parseInt(args[1])
                    console.log('change: ' + change)
                }
            }

            //Check to see if a quantity was given to the command
            if (args.length === 3){
                if (isNaN(parseInt(args[2]))){
                    message.reply(` you must enter a number for quantity`)
                    return
                }
                change = parseInt(args[2])
            }
            const query = { itemName : args[0], server_id : message.guild.id, owner : target}
            console.log(target + ' ' + change)

            //Update the target's inventory, then if their quantity for that item is 0, delete it
            const doc = await inventorySchema.findOneAndUpdate(
                query,{
                $inc : {quantity : -change}
            },{
                new : true,
                useFindAndModify : false
            })
            if(doc.quantity <= 0){
                await inventorySchema.findOneAndDelete({itemName : doc.itemName, server_id : doc.server_id, owner : doc.owner})
            }
            message.reply(` ${change} ${args[0]} taken from ${target}`)
        } finally {
            mongoose.connection.close()
        }
    })
}