// Esse arquivo será responsável por enviar
// as conexões criadas localmente
// para tratamento remoto

const ipc = require('node-ipc');

ipc.config.id     = 'sigma-cli';
ipc.config.retry  = 1000;
ipc.config.silent = true;

ipc.connectTo('instance-monitor', () => {

    ipc.of['instance-monitor'].on('connect', () => {

        //process.exit();

    });

});