import { getDb } from '/imports/api/db';
import { setDbReady } from '/imports/api/stateDb';

export async function initDatabase() {
  const db = await getDb();
  
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS positions (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE
      )
    `);
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        fname VARCHAR(256) NOT NULL,
        lname VARCHAR(256) NOT NULL,
        position_id INT UNSIGNED NOT NULL,
        FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE
      )
    `);
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS translations (
        token VARCHAR(256) PRIMARY KEY,
        translation VARCHAR(256) NOT NULL
      )
    `);
    
    const [positionsCount] = await db.execute('SELECT COUNT(*) as count FROM positions');
    if ((positionsCount as any)[0].count === 0) {
      await db.execute(`INSERT INTO positions (name) VALUES ('officer'), ('manager'), ('operator')`);
      await db.execute(`INSERT INTO translations (token, translation) VALUES 
        ('officer', 'офицер'),
        ('manager', 'менеджер'),
        ('operator', 'оператор')`);
      
      const [positions] = await db.execute('SELECT id, name FROM positions');
      const posMap = new Map();
      (positions as any[]).forEach(p => posMap.set(p.name, p.id));
      
      await db.execute(`
        INSERT INTO customers (fname, lname, position_id) VALUES
        ('Dino', 'Fabrello', ?),
        ('Walter', 'Marangoni', ?),
        ('Angelo', 'Ottogialli', ?)
      `, [posMap.get('officer'), posMap.get('manager'), posMap.get('operator')]);
      
      console.log('Тестовые данные добавлены');
    }
    
    console.log('Все таблицы созданы');
    setDbReady();
    
  } catch (error) {
    console.error('Ошибка создания таблиц:', error);
    throw error;
  }
}