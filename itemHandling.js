const mongo = require('./mongo')
const command = require('./command')
const itemSchema = require('./schemas/itemSchema')

module.exports = (client) => {

	//!addItem [NAME] [DESC]
	command(client, 'addItem', async (message) => {
		const { member, channel, content, guild} = message

		let text = content
		var parts = text.split(/ +/)

		if(parts.length < 2){
			channel.send('Please provide an item name')
			return
		}

		parts.shift()
		//[NAME] [DESC]
		text = parts.join(' ')
		parts = text.split('[')
		for (i=0; i<parts.length; i++){
			if(i > 2){
				channel.send('addItem must contain the following parameters: [name] [description]')
				return
			}
			parts[i] = parts[i].replace(']','')
		}

		await mongo().then(async (mongoose) => {
			try {
				await new itemSchema({
					name: parts[1],
					server_id: guild.id,
					party: true,
					owner: message.author.id,
					quantity: '1',
					description: parts[2]
				}).save()
			} finally {
				mongoose.connection.close()
			}
		})
	})

}