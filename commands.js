const path = require('path');
const fs   = require('fs-extra');

let Util = require('./util');

global.util = Util;

module.exports = {
    
    exec(argv){
        
        if(argv.length == 0) return console.log('__dirname: ' + __dirname);
        
        if(module.exports.commands[argv[0]]){
            module.exports.commands[argv[0]](argv.slice(1));
        }
        
    },
    
    commands: {
        
        join(argv){

            let cwd = process.cwd();

            let column = argv[0];

            let filename1 = path.join(cwd, argv[1]);
            let filename2 = path.join(cwd, argv[2]);
            let filename3 = path.join(cwd, argv[3]);

            if(!fs.existsSync(filename1)){
                return console.log(`O arquivo ${filename1} não existe`);
            }

            if(!fs.existsSync(filename2)){
                return console.log(`O arquivo ${filename2} não existe`);
            }

            let obj1 = Util.excelToJson(filename1);
            let obj2 = Util.excelToJson(filename2);

            let aux = {};

            let columns = [];

            obj1.forEach((line, k) => {
    
                if(!k){

                    Object.keys(line).forEach(column => {

                        if(!columns.includes(column)) columns.push(column);

                    });

                    return;

                }
                
                if(!aux[line[column]]) aux[line[column]] = [];
                
                aux[line[column]].push(line);
                
            });
            
            obj2.forEach((line, k) => {

                if(!k){

                    Object.keys(line).forEach(column => {

                        if(!columns.includes(column)) columns.push(column);

                    });

                    return;

                }

                if(!aux[line[column]]) aux[line[column]] = [];
                
                aux[line[column]].push(line);
                
            });
            
            let final = [];

            Object.keys(aux).forEach((key, i) => {
                
                let obj = {};
                
                aux[key].forEach(line => {
                    
                    Object.keys(line).forEach(column => {
                        
                        obj[column] = line[column];
                        
                    });
                    
                });
                
                if(!i){

                    final.push(columns);

                }
                
                let lineArr = [];

                columns.forEach(column => {
                    
                    lineArr.push(obj[column]);

                });

                final.push(lineArr);
                
            });

            Util.arrayToXlsx(filename3, final);
            
        },

        clear(argv){

            let cwd = process.cwd();
            
            let column = argv[0];
            
            let filename1 = path.join(cwd, argv[1]);
            let filename2 = path.join(cwd, argv[2]);

            if(!fs.existsSync(filename1)){
                return console.log(`O arquivo ${filename1} não existe`);
            }
            
            let obj1 = Util.excelToJson(filename1);

            let aux = [];

            obj1.forEach((line, k) => {
                
                if(line[column]) aux.push(line);

            });

            let final = [];

            let columns = Object.keys(aux[0]);

            aux.forEach((line, i) => {
                
                if(!i){

                    final.push(columns);

                }
                
                let lineArr = [];

                columns.forEach(column => {

                    lineArr.push(line[column]);

                });

                final.push(lineArr);
                
            });

            Util.arrayToXlsx(filename2, final);
            
        },

        parse(argv){

            let result = module.exports.parseFile(argv);

            if(!result || !result.then) return;

            return result.then(table => {

                if(!table) return console.log("Sem retorno");

                let array = [];

                table.forEach((line, k) => {
                    
                    if(k > 20) return;
                    
                    array.push(line);
      
                });

                console.log(Util.table(array));

            });

        },

        pipe(argv){

            let cwd = process.cwd();

            return module.exports.parseFile(argv).then(table => {

                if(!table) return console.log("Sem retorno");

                let filename = path.join(cwd, argv[1]);

                Util.arrayToXlsx(filename, table);

            });

        }
 
    },

    // Analisa um determinado formato de arquivo
    parseFile(argv){
        
        let cwd = process.cwd();
        
        let filename = path.join(cwd, argv[0]);

        let type = path.extname(filename);
        
        if(!fs.existsSync(filename)) return console.log("Arquivo inexistente");

        let final = Promise.resolve(false);

        switch(type){
            case '.ods':
            case '.xls':
            case '.csv':
            case '.tsv':
            case '.xlsx':
                
                let table = Util.excelToArray(filename);

                final = Promise.resolve(table);

            break;
            case '.sigma':

                final = module.exports.parseSigma(filename, argv);

            break;
            case '.sql':

                final = module.exports.parseSql(filename, argv);

            break;
            default:
                console.log(`Extensão ${type} não configurada`);
            break;
        }

        return final;

    },

    parseSigma(filename, argv){

        let sigma = require(filename);

        if(!sigma.type){

            return Promise.reject('Sigma type is needed');

        }

        switch(sigma.type){

            case 'json readdir':

                return fs.readdir(sigma.cwd).then(files => {

                    let filesPromise = [];

                    files.forEach(file => {

                        let readJson = fs.readJson(path.join(sigma.cwd, file));

                        filesPromise.push(readJson.then(json => {

                            return sigma.each(json);

                        }));

                    });

                    return Promise.all(filesPromise).then(() => {

                        return sigma.main();

                    });

                });

            break;
            case 'free':
                return sigma.main(argv, Util);
            break;
            default:

                console.log(`O tipo ${sigma.type} não foi encontrado`);
                return Promise.reject();

            break;

        }

    },
    
    parseSql(filename, argv){

        console.log(`@info Parsing .sql file`);
        console.log(filename);

        let file = fs.readFileSync(filename, 'utf-8');

        console.log(file);

        return Promise.resolve();

    }

}