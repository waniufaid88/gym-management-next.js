import db from ".";

export async function getUsers() {
  const users = await db.query.User.findMany();

  return users;
}

