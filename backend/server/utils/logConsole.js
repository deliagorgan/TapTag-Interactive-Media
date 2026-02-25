const chalk = require('chalk');


function logError(filePrefix, err) {
    console.log(chalk.yellow.bold(filePrefix) + chalk.red(err));
}

function logSuccess(filePrefix, message) {
    console.log(chalk.yellow.bold(filePrefix) + chalk.green(message));
}


module.exports = {
    logError,
    logSuccess
}
