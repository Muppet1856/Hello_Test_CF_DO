// src/api/match.ts
export async function createMatch(sql: any, request: Request): Promise<Response> {
  const body = await request.json();  // Expect JSON: { date: "...", location: "...", ... }
  if (body) {
    sql.exec('BEGIN;');
    try {
      sql.exec(`
        INSERT INTO matches (date, location, types, opponent, jersey_color_home, jersey_color_opp, result_home, result_opp, first_server, players, finalized_sets, is_swapped)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, body.date || null, body.location || null, body.types || null, body.opponent || null, body.jersey_color_home || null, body.jersey_color_opp || null, body.result_home || 0, body.result_opp || 0, body.first_server || null, body.players || null, body.finalized_sets || null, body.is_swapped || 0);
      const newId = sql.exec(`SELECT last_insert_rowid()`).toArray()[0][0];
      sql.exec('COMMIT;');
      return new Response(JSON.stringify({ success: true, id: newId }), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
      sql.exec('ROLLBACK;');
      return new Response("Error creating match: " + (error as Error).message, { status: 500 });
    }
  } else {
    return new Response("No body provided", { status: 400 });
  }
}

export async function setLocation(sql: any, matchId: number, location: string): Promise<Response> {
  sql.exec('BEGIN;');
  try {
    sql.exec(`UPDATE matches SET location = ? WHERE id = ?`, location, matchId);
    sql.exec('COMMIT;');
    return new Response("Location updated successfully", { status: 200 });
  } catch (error) {
    sql.exec('ROLLBACK;');
    return new Response("Error updating location: " + (error as Error).message, { status: 500 });
  }
}

export async function setDateTime(sql: any, matchId: number, date: string): Promise<Response> {
  sql.exec('BEGIN;');
  try {
    sql.exec(`UPDATE matches SET date = ? WHERE id = ?`, date, matchId);
    sql.exec('COMMIT;');
    return new Response("Date updated successfully", { status: 200 });
  } catch (error) {
    sql.exec('ROLLBACK;');
    return new Response("Error updating date: " + (error as Error).message, { status: 500 });
  }
}

export async function setOppName(sql: any, matchId: number, opponent: string): Promise<Response> {
  sql.exec('BEGIN;');
  try {
    sql.exec(`UPDATE matches SET opponent = ? WHERE id = ?`, opponent, matchId);
    sql.exec('COMMIT;');
    return new Response("Opponent name updated successfully", { status: 200 });
  } catch (error) {
    sql.exec('ROLLBACK;');
    return new Response("Error updating opponent name: " + (error as Error).message, { status: 500 });
  }
}

export async function setType(sql: any, matchId: number, types: string): Promise<Response> {
  sql.exec('BEGIN;');
  try {
    sql.exec(`UPDATE matches SET types = ? WHERE id = ?`, types, matchId);
    sql.exec('COMMIT;');
    return new Response("Type updated successfully", { status: 200 });
  } catch (error) {
    sql.exec('ROLLBACK;');
    return new Response("Error updating type: " + (error as Error).message, { status: 500 });
  }
}

export async function setResult(sql: any, matchId: number, resultHome: number, resultOpp: number): Promise<Response> {
  sql.exec('BEGIN;');
  try {
    sql.exec(`UPDATE matches SET result_home = ?, result_opp = ? WHERE id = ?`, resultHome, resultOpp, matchId);
    sql.exec('COMMIT;');
    return new Response("Result updated successfully", { status: 200 });
  } catch (error) {
    sql.exec('ROLLBACK;');
    return new Response("Error updating result: " + (error as Error).message, { status: 500 });
  }
}

export async function setPlayers(sql: any, matchId: number, players: string): Promise<Response> {
  sql.exec('BEGIN;');
  try {
    sql.exec(`UPDATE matches SET players = ? WHERE id = ?`, players, matchId);
    sql.exec('COMMIT;');
    return new Response("Players updated successfully", { status: 200 });
  } catch (error) {
    sql.exec('ROLLBACK;');
    return new Response("Error updating players: " + (error as Error).message, { status: 500 });
  }
}

export async function setHomeColor(sql: any, matchId: number, jerseyColorHome: string): Promise<Response> {
  sql.exec('BEGIN;');
  try {
    sql.exec(`UPDATE matches SET jersey_color_home = ? WHERE id = ?`, jerseyColorHome, matchId);
    sql.exec('COMMIT;');
    return new Response("Home jersey color updated successfully", { status: 200 });
  } catch (error) {
    sql.exec('ROLLBACK;');
    return new Response("Error updating home jersey color: " + (error as Error).message, { status: 500 });
  }
}

export async function setOppColor(sql: any, matchId: number, jerseyColorOpp: string): Promise<Response> {
  sql.exec('BEGIN;');
  try {
    sql.exec(`UPDATE matches SET jersey_color_opp = ? WHERE id = ?`, jerseyColorOpp, matchId);
    sql.exec('COMMIT;');
    return new Response("Opponent jersey color updated successfully", { status: 200 });
  } catch (error) {
    sql.exec('ROLLBACK;');
    return new Response("Error updating opponent jersey color: " + (error as Error).message, { status: 500 });
  }
}

export async function setFirstServer(sql: any, matchId: number, firstServer: string): Promise<Response> {
  sql.exec('BEGIN;');
  try {
    sql.exec(`UPDATE matches SET first_server = ? WHERE id = ?`, firstServer, matchId);
    sql.exec('COMMIT;');
    return new Response("First server updated successfully", { status: 200 });
  } catch (error) {
    sql.exec('ROLLBACK;');
    return new Response("Error updating first server: " + (error as Error).message, { status: 500 });
  }
}

export async function getSets(sql: any, matchId: number): Promise<Response> {
  const cursor = sql.exec(`SELECT * FROM sets WHERE match_id = ?`, matchId);
  const rows = cursor.toArray();
  return new Response(JSON.stringify(rows), { headers: { 'Content-Type': 'application/json' } });
}

export async function getMatches(sql: any): Promise<Response> {
  const cursor = sql.exec(`SELECT * FROM matches`);
  const rows = cursor.toArray();
  return new Response(JSON.stringify(rows), { headers: { 'Content-Type': 'application/json' } });
}

