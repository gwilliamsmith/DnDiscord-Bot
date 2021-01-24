const mongo = require('./mongo')
const command = require('./command')
const itemSchema = require('./schemas/itemSchema')

module.exports = (client) => {

	//!viewItem [NAME]
	//Grabs an item from the server's list and shows its description
	command(client, 'viewItem', async (message) => {
		const { member, channel, content, guild} = message


		parts = checkParams(message, channel, content, 1, '!viewItem', ['[name]'])
		if(!parts.length){
			return
		}

		name = parts[1]
		await mongo().then(async (mongoose) => {
			try{
				const check = await itemSchema.exists({name, server_id: guild.id})
				if(!check){
					channel.send('<@' + message.author.id + '>, that item does not exist here.')
				}
				else {
					const data = await itemSchema.find({name, server_id: guild.id})
					channel.send('**' + name + '**' + '\n> ' + data[0]['description'])
				}
			} finally {
				mongoose.connection.close()
			}
		})
	})

	//!deleteItem [NAME]
	//Deletes an item from the server's list of items
	command(client, 'deleteItem', async (message) => {
		const { member, channel, content, guild} = message

		checkPermissions(channel, member, message)

		parts = checkParams(message, channel, content, 1, '!deleteItem', ['[name]'])
		if(!parts.length){
			return
		}

		await mongo().then(async (mongoose) => {
			var success
			try{
				const check = await itemSchema.deleteOne({name, server_id : guild.id})
				success = true
			} finally { 
				mongoose.connection.close()
				if(success){
					channel.send('<@' + message.author.id + '>, item deleted!')
				}
			}
		})
	})

	//Checks to 
	function checkPermissions(channel, member, message){
		if(!member.hasPermission('ADMINISTRATOR') && !member.roles.cache.has('802227962161266689')){
			channel.send('<@' + message.author.id + '>, you do not have the appropriate permissions to use this command')
			return
		}
	}
}