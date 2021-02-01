const mongo = require('../../mongo')
const itemSchema = require('../../schemas/itemSchema')
const inventorySchema = require('../../schemas/inventorySchema')
const { prefix } = require('../../config.json')

module.exports = {
	name: 'viewInventory',
	description: 'Direct messages the author player or party inventory. DMs can look at anyone\'s inventory.',
	minArgs: 0,
    maxArgs: 1,
    expectedArgs: ['(optional) <target>'],
	execute(message, args) {
		run(message, args)
	},
	help: true,
	helpString: `**${prefix}viewInventory** PMs the author the player's or party's inventory. DMs can view other player inventories.
It takes a maximum of one argument: \n
(optional) <target>: The inventory to view. DM's can tag other players to view their inventories, while non-DMs can only view the party inventory.`
}

async function run(message, args){
	await mongo().then(async (mongoose) =>{
		try{
			var target = message.author.id
			var name = message.author.username
			//If there's an argument, that means they're trying to look at an inventory that's not their own - default to 'party' to see the server's party inventory
			if(args.length === 1){
				target = 'party'
				name = 'party'
				//If a user is mentioned, check to see if the author is a DM. If yes, set target to the tagged user. If not, complain
				if(message.mentions.members.first()){
					if(message.member.roles.cache.find(r => r.name === 'DM')){
						target = message.mentions.members.first().id
						name = message.mentions.members.first().user.username
					} else {
						message.reply(` you must have the DM role to view other player inventories`)
						return
					}
				}
			}
			const res = await inventorySchema.find({server_id : message.guild.id, owner : target})
			var outString = `__**Viewing the inventory for ${name}**__ \n\n`
			message.author.send(outString)
			outString = ``
			for(var i=0;i<res.length;i++){
				const item = await itemSchema.find({name : res[i].itemName, server_id : message.guild.id})
				outString += `> **${res[i].itemName}** \n`
				outString += `> ${item[0].description} \n`
				outString += `> Quantity:${res[i].quantity} \n`
			}
			message.author.send(outString,{split : {prepend: '>'}})
		} finally {
			mongoose.connection.close()
		}
	})
}