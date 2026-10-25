const fs = require("fs/promises");
const path = require("path");
const { promisify } = require("util");
const { randomBytes, scrypt: scryptCallback, timingSafeEqual } = require("crypto");

const scrypt = promisify(scryptCallback);
const DATA_DIRECTORY = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIRECTORY, "users.json");
const PASSWORD_BYTES = 64;

async function readUsers() {
  let fileContents;

  try {
    fileContents = await fs.readFile(DATA_FILE, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    await fs.mkdir(DATA_DIRECTORY, { recursive: true });
    await fs.writeFile(DATA_FILE, "[]\n", "utf8");
    return [];
  }

  const users = JSON.parse(fileContents);
  if (!Array.isArray(users) || users.some(function (user) {
    return (
      !user ||
      typeof user.id !== "string" ||
      typeof user.name !== "string" ||
      typeof user.email !== "string" ||
      !/^[a-f0-9]{32}$/.test(user.salt) ||
      !/^[a-f0-9]{128}$/.test(user.passwordHash)
    );
  })) {
    throw new Error("User data contains invalid records.");
  }

  return users;
}

async function writeUsers(users) {
  if (!Array.isArray(users)) {
    throw new TypeError("Users must be an array.");
  }

  await fs.mkdir(DATA_DIRECTORY, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2) + "\n", "utf8");
}

async function hashPassword(password, salt) {
  const passwordHash = await scrypt(password, salt, PASSWORD_BYTES);
  return passwordHash.toString("hex");
}

async function createUser(name, email, password) {
  const users = await readUsers();
  if (users.some(function (user) {
    return user.email === email;
  })) {
    return null;
  }

  const salt = randomBytes(16).toString("hex");
  const user = {
    id: randomBytes(16).toString("hex"),
    name: name,
    email: email,
    salt: salt,
    passwordHash: await hashPassword(password, salt),
  };

  users.push(user);
  await writeUsers(users);
  return user;
}

async function verifyUser(email, password) {
  const users = await readUsers();
  const user = users.find(function (entry) {
    return entry.email === email;
  });
  if (!user) {
    return null;
  }

  const submittedHash = Buffer.from(await hashPassword(password, user.salt), "hex");
  const storedHash = Buffer.from(user.passwordHash, "hex");
  if (!timingSafeEqual(submittedHash, storedHash)) {
    return null;
  }

  return user;
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

module.exports = {
  createUser,
  publicUser,
  readUsers,
  verifyUser,
};
