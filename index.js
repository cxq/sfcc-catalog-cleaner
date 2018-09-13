#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv;
const inputSource = process.argv[2];
const outputSource = process.argv[3];

if (!inputSource) {
    console.log('Input source is missing');
    return;
}

if (!outputSource) {
    console.log('Output source is missing');
    return;
}

const sourcePath = path.resolve(inputSource);
const outputPath = path.resolve(path.join(outputSource));

// Check if directory exists
fs.stat(sourcePath, (error) => {
    if (error) {
        console.log('Your input source cannot be found');
        return;
    }

    const chalk = require('chalk');
    const parseXML = require('./scripts/parseXML');
    const mergeXML = require('./scripts/mergeXML');
    const displayResults = require('./scripts/displayResults');
    console.time('Total time');
    console.log(chalk.green('Start processing...\n'));
    parseXML(inputSource)
    .then(mergeXML.bind(this, outputPath))
    // .then(displayResults.bind(this, outputPath))
    // .then(() => {
    //     console.log('\n---------------------------------------------------------------');
    //     console.log(chalk.bold(' Total duration '));
    //     console.log('---------------------------------------------------------------\n');
    //     console.timeEnd('Total time');
    // })
}); 
