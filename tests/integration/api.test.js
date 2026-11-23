/**
 * Integration tests for the PHP API in api/.
 *
 * These call the real PHP endpoints over HTTP. In CI, GitHub Actions starts a
 * MySQL service loaded with tests/sql/schema.sql and serves api/ with PHP's
 * built-in server (see .github/workflows/ci.yml). Node only sends requests;
 * the app itself still runs on PHP + MySQL.
 *
 * Set API_BASE_URL to point at another server (default http://127.0.0.1:8000).
 */
const BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

async function post(endpoint, payload) {
  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(payload)
  });
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`${endpoint} did not return valid JSON:\n${text}`);
  }
  return { response, json };
}

describe("POST /Login.php", () => {
  test("returns the user for a valid login", async () => {
    const { response, json } = await post("Login.php", {
      login: "testuser",
      password: "testpass"
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/application\/json/);
    expect(json).toEqual({
      id: expect.any(Number),
      firstName: "Test",
      lastName: "User",
      error: ""
    });
    expect(json.id).toBeGreaterThan(0);
  });

  test("returns id 0 and an error for a wrong password", async () => {
    const { response, json } = await post("Login.php", {
      login: "testuser",
      password: "not-the-password"
    });

    expect(response.status).toBe(200);
    expect(json).toEqual({
      id: 0,
      firstName: "",
      lastName: "",
      error: "No Records Found"
    });
  });
});

describe("POST /SearchColors.php", () => {
  test("returns matching colors for the user as a results array", async () => {
    const { response, json } = await post("SearchColors.php", {
      search: "blue",
      userId: 1
    });

    expect(response.status).toBe(200);
    expect(Object.keys(json).sort()).toEqual(["error", "results"]);
    expect(json.error).toBe("");
    expect(Array.isArray(json.results)).toBe(true);
    expect(json.results.sort()).toEqual(["Blue", "Light Blue"]);
  });

  test("returns an error payload when nothing matches", async () => {
    const { json } = await post("SearchColors.php", {
      search: "no-such-color",
      userId: 1
    });

    expect(json.error).toBe("No Records Found");
    expect(json.results).toBeUndefined();
  });
});

describe("POST /AddColor.php", () => {
  test("adds a color that SearchColors can then find", async () => {
    const color = `Test Color ${Date.now()}`;

    const added = await post("AddColor.php", { color, userId: 1 });
    expect(added.response.status).toBe(200);
    expect(added.json).toEqual({ error: "" });

    const found = await post("SearchColors.php", { search: color, userId: 1 });
    expect(found.json).toEqual({ results: [color], error: "" });
  });
});
