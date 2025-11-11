// src/api/player.ts
export async function createPlayer(sql: any, request: Request): Promise<Response> {
  const body = await request.json();  // Expect JSON: { number: "...", last_name: "...", initial: "..." }
  if (body) {
    sql.exec('BEGIN;');
    try {
      sql.exec(`
        INSERT INTO players (number, last_name, initial)
        VALUES (?, ?, ?)
      `, body.number, body.last_name, body.initial || '');
      const newId = sql.exec(`SELECT last_insert_rowid()`).toArray()[0][0];
      sql.exec('COMMIT;');
      return new Response(JSON.stringify({ success: true, id: newId }), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
      sql.exec('ROLLBACK;');
      return new Response("Error creating player: " + (error as Error).message, { status: 500 });
    }
  } else {
    return new Response("No body provided", { status: 400 });
  }
}

export async function setPlayerLName(sql: any, playerId: number, lastName: string): Promise<Response> {
  sql.exec('BEGIN;');
  try {
    sql.exec(`UPDATE players SET last_name = ? WHERE id = ?`, lastName, playerId);
    sql.exec('COMMIT;');
    return new Response("Last name updated successfully", { status: 200 });
  } catch (error) {
    sql.exec('ROLLBACK;');
    return new Response("Error updating last name: " + (error as Error).message, { status: 500 });
  }
}

export async function setPlayerFName(sql: any, playerId: number, initial: string): Promise<Response> {
  sql.exec('BEGIN;');
  try {
    sql.exec(`UPDATE players SET initial = ? WHERE id = ?`, initial, playerId);
    sql.exec('COMMIT;');
    return new Response("Initial/First name updated successfully", { status: 200 });
  } catch (error) {
    sql.exec('ROLLBACK;');
    return new Response("Error updating initial/first name: " + (error as Error).message, { status: 500 });
  }
}

export async function setPlayerNumber(sql: any, playerId: number, number: string): Promise<Response> {
  sql.exec('BEGIN;');
  try {
    sql.exec(`UPDATE players SET number = ? WHERE id = ?`, number, playerId);
    sql.exec('COMMIT;');
    return new Response("Player number updated successfully", { status: 200 });
  } catch (error) {
    sql.exec('ROLLBACK;');
    return new Response("Error updating player number: " + (error as Error).message, { status: 500 });
  }
}

export async function getPlayer(sql: any, playerId: number): Promise<Response> {
  const cursor = sql.exec(`SELECT * FROM players WHERE id = ?`, playerId);
  const row = cursor.toArray()[0] || null;
  return new Response(JSON.stringify(row), { headers: { 'Content-Type': 'application/json' } });
}

export async function getPlayers(sql: any): Promise<Response> {
  const cursor = sql.exec(`SELECT * FROM players`);
  const rows = cursor.toArray();
  return new Response(JSON.stringify(rows), { headers: { 'Content-Type': 'application/json' } });
}