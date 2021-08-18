const config = require('./config.json');
const Discord = require('discord.js');
const discord = new Discord.Client();

// Declare
if (!config || !config.discord_token || !config.discord_channel_ids || !config.listen_path || !config.listen_port)
  throw new Error("Please configure 'config.json'");

let instances = null;

function loadInstances() {
  instances = Object.entries(config.discord_channel_ids).reduce((obj, [server_id, channel_id]) => {
    ////console.log(discord.channels.cache.get(channel_id));
    obj[server_id] = { channel_id, server_id, discord_queue: [], channel: discord.channels.cache.get(channel_id) }; // Server to channel lookup
    obj[channel_id] = obj[server_id]; // Channel to server lookup
    return obj;
  }, {});
}

// Handle messages from Discord
discord.on('ready', () => {
  console.log('Connected to Discord');
  loadInstances();
  loadFastify();
});

discord.on('message', msg => {
  console.log(msg.content);
  instances[msg.channel.id]?.discord_queue.push({name: msg.author.username, msg: msg.content}); // Add message to channel queue, if it's in the config
});

discord.login(config.discord_token);

// Handle messages from Game
const fastify = require('fastify')();
fastify.register(require('fastify-formbody'))

function loadFastify() {
  function routeGame(request, reply) {
    const body = request.body || request.query;
    const server_id = body.server_id || '';
    
    console.log(Date.now());
    const instance = instances[server_id];
    if (!instance)
      throw new Error(`server_id '${server_id}' does not exist in 'config.json'`);

    const discord_messages = instance.discord_queue;
    instance.discord_queue = [];

    // Bad naming from original code
    if (body.msgs) {
      body.msgs = JSON.parse(body.msgs);

      for(const message of body.msgs) {
        switch (message.type) {
          case 'chat':
            //let {name, steam_id, team, body} = message;
            let teamName = '[Spec]';
            if (message.team_id <= 1)
              teamName = (message.team_id == 0)? '[Marine]': '[Alien]';
            
            instance.channel.send(`${teamName} ${message.name}: ${message.body}`);
            break;
          case 'player':
            //let {name, steam_id, player_count, sub} = message;
            instance.channel.send(`${message.name} has ${(message.sub === 'join')? 'joined': 'left'} the server (${message.player_count})`);
            break;
          case 'info':
            //let {body, sub} = message;
            break;
          case 'status':
            //let {body, sub, player_count} = message;
            instance.channel.send(`${message.body} (${message.player_count})`);
            break;
          case 'adminprint':
            //let {body} = message;
            instance.channel.send(`${message.body}`);
            break;
        }
      }
    }

    return merge_chat_return(discord_messages);
  }

  fastify.get(config.listen_path, routeGame);
  fastify.post(config.listen_path, routeGame);
  //

  function routeSend(request, reply) {
    const body = request.body || request.query;
    const server_id = body.server_id || '';
    
    console.log(Date.now());
    const instance = instances[server_id];
    if (!instance)
      throw new Error(`server_id '${server_id}' does not exist in 'config.json'`);
    
    if (!body.body)
      throw new Error(`name parameter is undefined`);

    instance.discord_queue.push({name: body.name || "", msg: body.body});
    
    const output = (body.name? `${body.name}: `: '') + body.body;
    instance.channel.send(output);

    return { success: true };
  }

  fastify.get(config.listen_path + '/send', routeSend);
  fastify.post(config.listen_path + '/send', routeSend);
  //

  fastify.listen(config.listen_port, config.listen_host || '0.0.0.0', async (err, address) => {
    if (err) throw new Error(err);
    console.log(`Listening on '${address}${config.listen_path}'`)
  })
}

function merge_chat_return(messages) {
  result = '';
  for(const message of messages)
    result += `chat${message.name}${message.msg}`;

  return result;
}
