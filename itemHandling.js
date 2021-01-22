const mongo = require('./mongo')
const command = require('./command')
const itemSchema = require('./schemas/itemSchema')

//TODO: Add permissions control to addItem and updateItem (admins, DMs)

module.exports = (client) => {

	//!addItem [NAME] [DESC]
	//Adds Item to the database - should only be usable by server admins or someone with the DM role
	command(client, 'addItem', async (message) => {
		const { member, channel, content, guild} = message

		let text = content
		var parts = text.split(/ +/)
		parts.shift()
		//[NAME] [DESC]
		text = parts.join(' ')
		parts = text.split('[')
		if(parts.length < 3){
			channel.send('<@' + message.author.id + '>, !addItem does not have the correct number of parameters. !addItem must contain the following parameters: [name] [description]')
			return
		}
		for (i=0; i<parts.length; i++){
			parts[i] = parts[i].trim().replace(']','')
		}

		await mongo().then(async (mongoose) => {
			try {
				await new itemSchema({
					name: parts[1],
					server_id: guild.id,
					party: true,
					owner: message.author.id,
					description: parts[2]
				}).save()
			} catch(e){
				if(e.code = 'E11000'){
					channel.send('<@' + message.author.id + '> An item with that name already exists. You can use !updateItem to change its description, or !viewItem to check its properties.')
				}
			} finally {
				mongoose.connection.close()
			}
		})
	})

	//!updateItem [NAME] [NEW DESC]
	//Updates an item in the database, replacing its old description with the provided one
	command(client, 'updateItem', async (message) => {
		const { member, channel, content, guild} = message

		let text = content
		var parts = text.split(/ +/)
		parts.shift()
		//[NAME] [DESC]
		text = parts.join(' ')
		parts = text.split('[')
		if(parts.length < 3){
			channel.send('<@' + message.author.id + '>, !updateItem does not have the correct number of parameters. !updateItem must contain the following parameters: [name] [description]')
			return
		}
		for (i=0; i<parts.length; i++){
			parts[i] = parts[i].trim().replace(']','')
		}

		await mongo().then(async (mongoose) => {
			try{
				const check = await itemSchema.exists({name: parts[1], server_id: guild.id})
				if(check){
					await itemSchema.findOneAndUpdate({
						name: parts[1],
						server_id: guild.id
					},{
						$set : {description: parts[2]}
					})
				}
				else {
					channel.send('<@' + message.author.id + '>, that item does not exist. You can use !addItem to create a new item.')
				}
			} finally {
				mongoose.connection.close()
			}
		})
	})

	//!viewItem [NAME]
	//Grabs an item from the server's list and shows its description
	command(client, 'viewItem', async (message) => {
				const { member, channel, content, guild} = message

		let text = content
		var parts = text.split(/ +/)
		parts.shift()
		//[NAME]
		text = parts.join(' ')
		parts = text.split('[')
		if(parts.length != 2){
			channel.send('<@' + message.author.id + '>, !viewItem does not have the correct number of parameters. !viewItem must contain the following parameters: [name].')
			return
		}
		name = parts[1].trim().replace(']','')
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

}