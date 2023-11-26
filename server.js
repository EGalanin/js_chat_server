const http = require('http');
const Koa = require('koa');
const { koaBody } = require('koa-body');
const cors = require('@koa/cors');
const WS = require('ws');
const uuid = require('uuid');
const { env } = require('process');

const app = new Koa();

app.use(cors());

app.use(koaBody({
    text: true,
    urlencoded: true,
    multipart: true,
    json: true
}));

const chat = [{
    user: 'Evgenyi',
    message: 'hello!!!'
}];

const users = ['Evgenyi',];
/////////////////////////////////

app.use(async (ctx) => {
    if (ctx.request.method !== 'GET') return;

    ctx.response.set('Access-Control-Allow-Origin', '*');
    ctx.response.body = users;
});

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());

const wsServer = new WS.Server({server});

wsServer.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'register') {
            users.push(data.nickname);

            Array.from(wsServer.clients)
                .filter(client => client.readyState === WS.OPEN)
                .forEach(client => client.send(JSON.stringify({
                    type: 'users',
                    users,
                })));
            return;
        }

        if (data.type === 'message') {
            chat.push(data.post);
            
            Array.from(wsServer.clients)
                .filter(client => readyState === WS.OPEN)
                .forEach(client => client.send(JSON.stringify({
                    type: 'message',
                    message: data.post,
                })));
                return;
        }        
    });

    ws.on('close', () => {
        Array.from(wsServer.clients)
            .filter(client => client.readyState === WS.OPEN)
            .forEach(client => client.send(JSON.stringify({
                type: 'users',
                users,
            })));
            return;
    });

    ws.send(JSON.stringify({type: 'allMessage', chat}));
});


server.listen(port, (err) => {
    if (err) {
        console.log('Ошибка в listen', err)
        return;
    }
    console.log(`Server listening to ${port}`);
});
