import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  "dizimo",
  "root",
  "Saopaulo2430@",
  {
    host: "localhost",
    dialect: "mariadb",
    logging: false
  }
);

export default sequelize;