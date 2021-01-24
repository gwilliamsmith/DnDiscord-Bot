const mongo = require('./mongo')
const command = require('./command')
const itemSchema = require('./schemas/itemSchema')

module.exports = (client) => {

	/*
	//!addItem [NAME] [DESC]
	//Adds Item to the database - should only be usable by server admins or someone with the DM role
	command(client, 'addItem', async (message) => {
		const { member, channel, content, guild} = message

		checkPermissions(channel, member, message)

		parts = checkParams(message, channel, content, 2, '!addItem', ['[name]','[description]'])
		if(!parts.length){
			return
		}

		await mongo().then(async (mongoose) => {
			var success = false
			try {
				await new itemSchema({
					name: parts[1],
					server_id: guild.id,
					party: true,
					owner: message.author.id,
					description: parts[2]
				}).save()
				success = true
			} catch(e){
				if(e.code = 'E11000'){
					channel.send('<@' + message.author.id + '> An item with that name already exists. You can use !updateItem to change its description, or !viewItem to check its properties.')
				}
			} finally {
				mongoose.connection.close()
				if(success){
					channel.send('<@' + message.author.id + '>, item added!')
				}
			}
		})
	})
	*/

	//!updateItem [NAME] [NEW DESC]
	//Updates an item in the database, replacing its old description with the provided one
	command(client, 'updateItem', async (message) => {
		const { member, channel, content, guild} = message

		checkPermissions(channel, message)

		parts = checkParams(message, channel, content, 2, '!updateItem', ['[name]','[description]'])
		if(!parts.length){
			return
		}

		await mongo().then(async (mongoose) => {
			var success = false
			try{
				const check = await itemSchema.exists({name: parts[1], server_id: guild.id})
				if(check){
					await itemSchema.findOneAndUpdate({
						name: parts[1],
						server_id: guild.id
					},{
						$set : {description: parts[2]}
					})
					success = true
				}
				else {
					channel.send('<@' + message.author.id + '>, that item does not exist. You can use !addItem to create a new item.')
				}
			} finally {
				mongoose.connection.close()
				if(success){
					channel.send('<@' + message.author.id + '>, item updated!')
				}
			}
		})
	})

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

	function checkParams(message, channel, content, num, command, params){
		let text = content
		var parts = text.split(/ +/)
		parts.shift()
		text = parts.join(' ')
		parts = text.split('[')
		if(parts.length < num+1){ //add 1 because split always looks like ['',...]
			channel.send('<@' + message.author.id + '>, ' + command + ' does not have the correct number of parameters. ' + command + ' must contain the following parameters: ' + params)
			return []
		}
		for (i=0; i<parts.length; i++){
			parts[i] = parts[i].trim().replace(']','')
		}
		return parts
	}
}