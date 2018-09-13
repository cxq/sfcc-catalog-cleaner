const fs = require('fs-extra');

/**
 * 
 * @param {Array} products List of products
 */
function getProducts(products) {
    return products.map((product) => {
        return {
            id: product.$['product-id'],
            variations: product.variations
        }
    });
}

/**
 * 
 * @param {String} filePath XML file path
 */
function readXML(filePath) {
    const parseString = require('xml2js').parseString;
    return new Promise((resolve) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log('The XML file cannot be found');
                throw err;
            }
            parseString(data, (err, result) => {
                if (err) {
                    throw err;
                }

                const products = getProducts(result.catalog.product);
                resolve({
                    [result.catalog.$['catalog-id']]: products
                });
            });
        });
    });
}

/**
 * 
 * @param {string} path path of the XML file
 */
module.exports = (sourcePath) => {
    const chalk = require('chalk');
    console.log(`Starting '${chalk.cyan('XML Parsing')}'...`);
    const performance = require('execution-time')();
    performance.start();
    const path = require('path');
    const klaw = require('klaw');
    const through2 = require('through2')

    return new Promise((resolve, reject) => {
        const filter = through2.obj(function (item, enc, next) {
            if (!item.stats.isDirectory() && path.extname(item.path) === '.xml') {
                this.push(item);
            }
            next();
        });

        const files = []; // files, directories, symlinks, etc
        klaw(sourcePath)
            .pipe(filter)
            .on('data', file => {
                files.push(readXML(file.path));
            })
            .on('end', () => {
                Promise.all(files).then((values) => {
                    const results = performance.stop();
                    console.log(`Finished '${chalk.cyan('XML Parsing')}' after ${chalk.magenta(results.time + 'ms')}`);
                    resolve(values);
                }, reject);
            });
    });
};