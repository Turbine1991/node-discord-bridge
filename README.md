# node_discord_bridge
Node.js standalone app for Natural Selection 2 &lt;-> Discord communication

## \#1 Create Discord Bot Token
https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token

## \#2 Get Channel Id
The bot requires a channel to send to and read messages from.

Enable Developer Mode. User Settings -> Advanced.
Right click a channel in Discord -> Copy ID.

## \#3 Clone repository
Ensure node.js is installed.

`git clone https://github.com/Turbine1991/node-discord-bridge.git`

Go inside directory.
`npm install`

## \#4 Configure config.json
```
{
  "discord_token": "PUT YOUR TOKEN HERE",
  "discord_channel_ids": {
    "server_1": "PUT YOUR CHANNEL ID HERE"
  },
  "listen_path": "/discordbridge",
  "listen_port": 3100
}
```

## \#5 Run
`node index`

## \#6 Bonus - Send message to game from external source
```
// POST (recommended)
curl -X POST -d 'server_id=REPLACE&body=Message' http://127.0.0.1:3100/discordbridge/send
// GET
curl "http://127.0.0.1:3100/discordbridge/send?server_id=REPLACE&body=Message"
```
