import { Meteor } from "meteor/meteor";
import LiveMysql, { LiveMysqlKeySelector } from "@vlasky/mysql-live-select";
import { isDbReady } from "/imports/api/stateDb";
import { getDb } from "/imports/api/db";

let liveConnection: any = null;

function getLiveConnection() {
  if (!liveConnection) {
    const settings = {
      host: Meteor.settings.mysql.host,
      user: Meteor.settings.mysql.user,
      password: Meteor.settings.mysql.password,
      database: Meteor.settings.mysql.database,
      serverId: 1,
    };

    console.log("Создание соединения с LiveMysql...");
    liveConnection = new LiveMysql(settings);

    liveConnection.on("error", (err: any) => {
      console.error("LiveMysql ошибка:", err);
    });
  }

  return liveConnection;
}

Meteor.publish("customers", async function () {
  console.log("Клиент подписался");

  let select: any = null;
  const liveDb = getLiveConnection();

  while (!isDbReady()) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  try {
    const db = await getDb();

    const [rows] = await db.execute(`
      SELECT 
        c.id,
        CONCAT(c.fname, ' ', c.lname) AS full_name,
        p.name AS position
      FROM customers c
      LEFT JOIN positions p ON c.position_id = p.id
      ORDER BY c.id
    `);

    const data = rows as any[];

    data.forEach((row: any) => {
      this.added("customers", row.id.toString(), row);
    });

    this.ready();
    console.log("Initial data sent:", data.length);
  } catch (err) {
    console.error("Initial load error:", err);
    return;
  }

  const sendReactive = () => {
    select = liveDb.select(
      `
      SELECT 
        c.id,
        CONCAT(c.fname, ' ', c.lname) AS full_name,
        p.name AS position
      FROM customers c
      LEFT JOIN positions p ON c.position_id = p.id
      ORDER BY c.id
      `,
      null,
      LiveMysqlKeySelector.Index(),
      [{ table: "customers" }, { table: "positions" }],
    );

    select.on("update", (diff: any, data: any) => {
      console.log("Data updated:", Object.keys(data).length);

      if (diff.removed) {
        Object.keys(diff.removed).forEach((id: string) => {
          this.removed("customers", id);
        });
      }

      if (diff.added) {
        Object.keys(diff.added).forEach((id: string) => {
          const customer = data[id];
          if (customer) {
            this.added("customers", id, customer);
          }
        });
      }

      if (diff.updated) {
        Object.keys(diff.updated).forEach((id: string) => {
          const customer = data[id];
          if (customer) {
            this.changed("customers", id, customer);
          }
        });
      }
    });

    select.on("error", (err: any) => {
      console.error("Select error:", err);
    });
  };

  setTimeout(() => {
    if (liveDb.ready) {
      sendReactive();
    } else {
      liveDb.once("ready", sendReactive);
    }
  }, 200);

  this.onStop(() => {
    console.log("📡 Клиент отписан");

    if (select) {
      select.stop();
      console.log("LiveMysql select остановлен");
    }
  });
});
