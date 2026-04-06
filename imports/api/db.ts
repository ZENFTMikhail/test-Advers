import mysql from "mysql2/promise";
import { Meteor } from "meteor/meteor";

let pool: mysql.Pool | null = null;

export async function getDb(): Promise<mysql.Pool> {
  if (!pool) {
    const config = Meteor.settings.mysql;

    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
    });

    console.log("MySQL пул создан");
  }

  return pool;
}
