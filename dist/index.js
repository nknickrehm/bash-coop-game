import path from "path";
import util from "util";
import child_process from "child_process";
import http from "http";
import Koa from "koa";
import koaStatic from "koa-static";
import socket from "socket.io";
const exec = util.promisify(child_process.exec);
const app = new Koa();
app.use(koaStatic(path.join(path.resolve(), 'static')));
const server = http.createServer(app.callback());
const io = socket(server);
server.listen(3000);
const players = [];
const currentPlayerInputOperations = 4;
let currentPlayer;
let currentLine = '';
let currentPlayerRemainingInput = 0;
io.on('connection', function (socket) {
    console.info(`New player joined: ${socket.id}`);
    players.push(socket.id);
    if (players.length === 1)
        selectCurrentPlayer();
    socket.on('disconnect', () => {
        console.info(`Player disconnected: ${socket.id}`);
        players.splice(players.indexOf(socket.id), 1);
        if (currentPlayer === socket.id) {
            selectCurrentPlayer();
        }
    });
    socket.on('stdin', (stdin) => {
        if (socket.id !== currentPlayer)
            return;
        console.log(`Valid stdin: ${stdin}`);
        currentLine += stdin;
        currentPlayerRemainingInput--;
        io.emit('stdin', { stdin, currentPlayerRemainingInput });
        if (currentPlayerRemainingInput <= 0)
            selectCurrentPlayer();
    });
    socket.on('abort', () => {
        if (socket.id !== currentPlayer)
            return;
        console.log(`Valid abort`);
        currentLine = '';
        currentPlayerRemainingInput--;
        io.emit('abort', currentPlayerRemainingInput);
        if (currentPlayerRemainingInput <= 0)
            selectCurrentPlayer();
    });
    socket.on('backspace', () => {
        if (socket.id !== currentPlayer)
            return;
        console.log('Valid backspace');
        currentLine = currentLine.slice(0, currentLine.length - 2);
        currentPlayerRemainingInput--;
        io.emit('backspace', currentPlayerRemainingInput);
        if (currentPlayerRemainingInput <= 0)
            selectCurrentPlayer();
    });
    socket.on('run', async () => {
        if (socket.id !== currentPlayer)
            return;
        console.log('Valid run');
        currentPlayerRemainingInput--;
        try {
            const { stdout } = await exec(currentLine);
            io.emit('stdout', { stdout, currentPlayerRemainingInput });
        }
        catch (e) {
            io.emit('stdout', { stdout: e.stderr || '', currentPlayerRemainingInput });
        }
        currentLine = '';
        if (currentPlayerRemainingInput <= 0)
            selectCurrentPlayer();
    });
    io.emit('tldr', { currentPlayer, currentPlayerRemainingInput });
});
const selectCurrentPlayer = () => {
    if (players.length < 1)
        currentPlayer = undefined;
    else if (players.length == 1)
        currentPlayer = players[0];
    else if (currentPlayer == undefined)
        currentPlayer = players[0];
    else
        currentPlayer = findPlayerOtherThan(currentPlayer);
    currentPlayerRemainingInput = currentPlayerInputOperations;
    io.emit('currentPlayer', { currentPlayer, currentPlayerRemainingInput });
    console.log(`Current player: ${currentPlayer}`);
};
const findPlayerOtherThan = (player) => {
    const otherPlayers = players.slice(0, players.length);
    otherPlayers.splice(players.indexOf(currentPlayer || ''), 1);
    return otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
};
