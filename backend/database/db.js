const { Sequelize } = require('sequelize');

const prefix = "DATABASE: ";

/*
    initialize Sequelize with the database configuration
*/
const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USERNAME,
    process.env.DATABASE_PASSWORD,
    {
        host: process.env.DATABASE_HOST,
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            timezone: "+02:00"
        }
    }
);


(async () => {
    const { logError, logSuccess } = require('../server/utils/');
    try {
        await sequelize.authenticate();
        logSuccess(prefix, 'Connection to MySQL established successfully with Sequelize.');
    } catch (err) {
        logError(prefix, `Unable to connect to the database with Sequelize: ${err}.`);
        process.exit(1);
    }
})();

module.exports = sequelize;
