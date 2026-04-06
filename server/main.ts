import { Meteor } from "meteor/meteor";
import { initDatabase } from "./initDb";
import "./publications";
import "/imports/api/methods/translation";

Meteor.startup(async () => {
  console.log("Сервер запускается...");
  await initDatabase();
  console.log("База данных готова");
});
