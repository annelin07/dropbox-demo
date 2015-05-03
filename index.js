
let fs = require('fs')
let express = require('express')
let path = require('path')
let morgan = require('morgan')
let nodeify = require('bluebird-nodeify')
let mime = require('mime-types')
let rimraf = require('rimraf')
let mkdirp = require('mkdirp')
// let bluebird = require('bluebird')
// bluebird.Promise.longStackTraces()
require('songbird')

let argv = require('yargs').argv
let app = express()
let net = require('net')
let JsonSocket = require('json-socket')
let events = require('events')
let eventEmitter = new events.EventEmitter()

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8000

let rootDir = argv.dir ? argv.dir : path.resolve(process.cwd())
if (NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

let tcpServer = net.createServer()
tcpServer.listen(9838)
tcpServer.on('connection', (socket) => { //This is a standard net.Socket
    console.log('TcpServer on connection')
    socket = new JsonSocket(socket) //Now we've decorated the net.Socket to be a JsonSocket

    eventEmitter.on('tcpMessageEvent', (tcpMessageData) => {
        console.log('Send message to tcpClient', tcpMessageData)
        socket.sendMessage(tcpMessageData)
    })

    socket.on('message', (message) => {
        console.log('Received message from tcpClient', message)
    })
})


app.listen(PORT, ()=> console.log(`LISTENING @ http://127.0.0.1:${PORT}`))

app.get('*', setFileMeta, sendHeaders, (req, res) => {
    if (res.body) {
        res.json(res.body)
        return
    }
    fs.createReadStream(req.filePath).pipe(res)
})

app.head('*', setFileMeta, sendHeaders, (req, res) => res.end())

function sendToTcpClient(updateType, req) {
    let tcpMessageData = {
        "action": updateType,
        "path": req.url,
        "type": req.isDir ? "dir" : "file",
        "contents": updateType === "delete" ? null : new Buffer(req.read()).toString('base64'),
        "updated": Date.now()
    }
    eventEmitter.emit('tcpMessageEvent', tcpMessageData)
}

app.delete('*', setFileMeta, (req, res, next) => {
    async ()=> {
        if (!req.stat) {
            return res.status(400).send("Invalid Path")
        }
        if (req.stat.isDirectory()) {
            await rimraf.promise(req.filePath)
        } else {
            await fs.promise.unlink(req.filePath)
        }
        res.end()

        sendToTcpClient("delete", req)
    }().catch(next)
})

// PUT for update
app.put('*', setFileMeta, setDirDetails, (req, res, next) => {
    async ()=>{
        if (!req.stat) return res.status(405).send("File does not exists")
        if (req.isDir) return res.status(405).send("Path is a directory")

        await fs.promise.truncate(req.filePath, 0)
        req.pipe(fs.createWriteStream(req.filePath))
        res.end()

        sendToTcpClient("put", req)
   }().catch(next)

})

// POST for create
app.post('*', setFileMeta, setDirDetails, (req, res, next) => {
    async ()=>{
        if (req.stat) return res.status(405).send("File exists")
        await mkdirp.promise(req.dirPath)
        if (!req.isDir) req.pipe(fs.createWriteStream(req.filePath))
        res.end()

        sendToTcpClient("post", req)
    }().catch(next)
})

function setDirDetails(req, res, next) {
    let filePath = req.filePath
    let endsWithSlash = filePath.charAt(filePath.length-1) === path.sep
    let hasExt = path.extname(filePath) !== ''
    req.isDir = endsWithSlash || !hasExt
    req.dirPath = req.isDir ? filePath : path.dirname(filePath)
    next()
}

function setFileMeta(req, res, next) {
    req.filePath = path.resolve(path.join(rootDir, req.url))
    if (req.filePath.indexOf(rootDir) !== 0) {
        res.send(400, "Invalid path")
        return
    }

    fs.promise.stat(req.filePath)
        .then(stat => req.stat = stat, () => req.stat = null)
        .nodeify(next)
}

function sendHeaders(req, res, next) {
    nodeify(async() => {
        if (!req.stat) {
            res.status(404).send("Invalid Path")
            return
        }
        if (req.stat.isDirectory()) {
            let files = await fs.promise.readdir(req.filePath)
            res.body = JSON.stringify(files)
            res.setHeader('Content-Length', res.body.length)
            res.setHeader('Content-Type', 'application/json')
            return
        }

        res.setHeader('Content-Length', req.stat.size)
        let contentType = mime.contentType(path.extname(req.filePath))
        res.setHeader('Content-Type', contentType)

    }(), next)
}
