// src/api/set.ts
export async function createSet(sql: any, request: Request): Promise<Response> {
  const body = await request.json();  // Expect JSON: { match_id: number, set_number: 1-5, ... }
  if (body) {
    sql.exec('BEGIN;');
    try {
      sql.exec(`
        INSERT INTO sets (match_id, set_number, home_score, opp_score, home_timeout_1, home_timeout_2, opp_timeout_1, opp_timeout_2)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, body.match_id, body.set_number, body.home_score || 0, body.opp_score || 0, body.home_timeout_1 || 0, body.home_timeout_2 || 0, body.opp_timeout_1 || 0, body.opp_timeout_2 || 0);
      const newId = sql.exec(`SELECT last_insert_rowid()`).toArray()[0][0];
      sql.exec('COMMIT;');
      return new Response(JSON.stringify({ success: true, id: newId }), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
      sql.exec('ROLLBACK;');
      return new Response("Error creating set: " + (error as Error).message, { status: 500 });
    }
  } else {
    return new Response("No body provided", { status: 400 });
  }
}

export async function setHomeScore(sql: any, setId: number, homeScore: number): Promise<Response> {
  sql.exec('BEGIN;');
  try {
    sql.exec(`UPDATE sets SET home_score = ? WHERE id = ?`, homeScore, setId);
    sql.exec('COMMIT;');
    return new Response("Home score updated successfully", { status: 200 });
  } catch (error) {
    sql.exec('ROLLBACK;');
    return new Response("Error updating home score: " + (error as Error).message, { status: 500 });
  }
}

export async function setOppScore(sql: any, setId: number, oppScore: number): Promise<Response> {
  sql.exec('BEGIN;');
  try {
    sql.exec(`UPDATE sets SET opp_score = ? WHERE id = ?`, oppScore, setId);
    sql.exec('COMMIT;');
    return new Response("Opponent score updated successfully", { status: 200 });
  } catch (error) {
    sql.exec('ROLLBACK;');
    return new Response("Error updating opponent score: " + (error as Error).message, { status: 500 });
  }
}

export async function setHomeTimeout(sql: any, setId: number, timeoutNumber: 1 | 2, value: 0 | 1): Promise<Response> {
  const field = timeoutNumber === 1 ? 'home_timeout_1' : 'home_timeout_2';
  sql.exec('BEGIN;');
  try {
    sql.exec(`UPDATE sets SET ${field} = ? WHERE id = ?`, value, setId);
    sql.exec('COMMIT;');
    return new Response("Home timeout updated successfully", { status: 200 });
  } catch (error) {
    sql.exec('ROLLBACK;');
    return new Response("Error updating home timeout: " + (error as Error).message, { status: 500 });
  }
}

export async function setOppTimeout(sql: any, setId: number, timeoutNumber: 1 | 2, value: 0 | 1): Promise<Response> {
  const field = timeoutNumber === 1 ? 'opp_timeout_1' : 'opp_timeout_2';
  sql.exec('BEGIN;');
  try {
    sql.exec(`UPDATE sets SET ${field} = ? WHERE id = ?`, value, setId);
    sql.exec('COMMIT;');
    return new Response("Opponent timeout updated successfully", { status: 200 });
  } catch (error) {
    sql.exec('ROLLBACK;');
    return new Response("Error updating opponent timeout: " + (error as Error).message, { status: 500 });
  }
}

export async function setIsFinal(sql: any, matchId: number, finalizedSets: string): Promise<Response> {
  // Assuming 'finalized_sets' is in matches table; update there
  sql.exec('BEGIN;');
  try {
    sql.exec(`UPDATE matches SET finalized_sets = ? WHERE id = ?`, finalizedSets, matchId);
    sql.exec('COMMIT;');
    return new Response("Finalized sets updated successfully", { status: 200 });
  } catch (error) {
    sql.exec('ROLLBACK;');
    return new Response("Error updating finalized sets: " + (error as Error).message, { status: 500 });
  }
}

export async function getSet(sql: any, setId: number): Promise<Response> {
  const cursor = sql.exec(`SELECT * FROM sets WHERE id = ?`, setId);
  const row = cursor.toArray()[0] || null;
  return new Response(JSON.stringify(row), { headers: { 'Content-Type': 'application/json' } });
}

export async function getSets(sql: any, matchId?: number): Promise<Response> {
  let query = `SELECT * FROM sets`;
  let params: any[] = [];
  if (matchId) {
    query += ` WHERE match_id = ?`;
    params.push(matchId);
  }
  const cursor = sql.exec(query, ...params);
  const rows = cursor.toArray();
  return new Response(JSON.stringify(rows), { headers: { 'Content-Type': 'application/json' } });
}