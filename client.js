let fs = require('fs')
let path = require('path')
let rimraf = require('rimraf')
let mkdirp = require('mkdirp')
let argv = require('yargs')
        .default({dir: process.cwd()})
        .argv

let net = require('net')
let JsonSocket = require('json-socket')
require('songbird')

console.log(argv)
let socket = new JsonSocket(new net.Socket()) //Decorate a standard net.Socket with JsonSocket
socket.connect(9838, '127.0.0.1')

function handleMessage(message) {
    if (message.action === 'delete') {
        handleDelete(message)
    } else if (message.action === 'post') {
        handlePost(message)
    } else if (message.action === 'put') {
        handlePut(message)
    } else {
        console.log('NOOP')
    }
}

socket.on('connect', () => { //Don't send until we're connected
    socket.on('message', (message) => {
        console.log('Received message from tcpServer: ', message)
        message.filePath = path.resolve(path.join(argv.dir, message.path))
        fs.promise.stat(message.filePath)
               .then(stat => message.stat = stat, () => message.stat = null)
               .then(() => handleMessage(message))
    })
})


function handleDelete(message) {
    async() => {
       console.log("DELETE", message)
        if (!message.stat) {
            console.log(`${message.action}: File doesn not exist ${message.filePath}`)
            return
        }
        if (message.type === 'dir') {
            await rimraf.promise(message.filePath)
        } else {
            await fs.promise.unlink(message.filePath)
        }
    }().catch(err => console.log(err))
}

// PUT for update
function handlePut(message) {
    async() => {
       console.log("PUT", message)
        if (!message.stat) {
            console.log(`${message.action}: File doesn not exist ${message.filePath}`)
            return
        }
        if (message.type === 'dir') {
            console.log(`${message.action}: ${message.filePath} is a directory`)
            return
        }
        await fs.promise.truncate(message.filePath, 0)
        let fw = fs.createWriteStream(message.filePath)
        fw.end(new Buffer(message.contents, 'base64').toString())
    }().catch(err => console.log(err))
}

// POST for create
function handlePost(message) {
    async() => {
        console.log("POST", message)
        if (message.stat) {
            console.log(`${message.action}: File exists ${message.filePath}`)
            return
        }
        let dirPath = message.type === 'dir' ? message.filePath : path.dirname(message.filePath)
        await mkdirp.promise(dirPath)
        if (message.type === 'file') {
            let fw = fs.createWriteStream(message.filePath)
            fw.end(new Buffer(message.contents, 'base64').toString())
        }
    }().catch(err => console.log(err))
}
