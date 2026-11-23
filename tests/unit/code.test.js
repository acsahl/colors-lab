/**
 * @jest-environment jsdom
 *
 * Front-end unit tests for public/js/code.js.
 *
 * code.js is a plain browser script (no modules), so the test loads its
 * source into a function and passes in a fake XMLHttpRequest and a fake
 * window.location. No PHP server is needed: these tests only check what the
 * browser code sends and how it shows the response.
 */
const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(
  path.join(__dirname, "../../public/js/code.js"),
  "utf8"
);

// Records every request the page code makes and lets a test reply to it.
class FakeXHR {
  constructor() {
    this.headers = {};
    this.readyState = 0;
    this.status = 0;
    this.responseText = "";
    FakeXHR.instances.push(this);
  }
  open(method, url, async) {
    this.method = method;
    this.url = url;
    this.async = async;
  }
  setRequestHeader(name, value) {
    this.headers[name] = value;
  }
  send(body) {
    this.body = body;
  }
  respond(status, json) {
    this.readyState = 4;
    this.status = status;
    this.responseText = JSON.stringify(json);
    this.onreadystatechange.call(this);
  }
}
FakeXHR.instances = [];

function loadApp() {
  const fakeWindow = { location: { href: "" } };
  const factory = new Function(
    "window",
    "XMLHttpRequest",
    source +
      "\nreturn { doLogin, readCookie, doLogout, addColor, searchColor," +
      " getState: () => ({ userId, firstName, lastName }) };"
  );
  return { app: factory(fakeWindow, FakeXHR), fakeWindow };
}

function clearCookies() {
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  });
}

beforeEach(() => {
  FakeXHR.instances = [];
  clearCookies();
  document.body.innerHTML = `
    <input id="loginName" />
    <input id="loginPassword" />
    <span id="loginResult"></span>
    <input id="colorText" />
    <span id="colorAddResult"></span>
    <input id="searchText" />
    <span id="colorSearchResult"></span>
    <p id="colorList"></p>
  `;
});

describe("addColor", () => {
  test("posts the typed color and the user id as JSON to AddColor.php", () => {
    const { app } = loadApp();
    document.getElementById("colorText").value = "Teal";

    app.addColor();

    expect(FakeXHR.instances).toHaveLength(1);
    const xhr = FakeXHR.instances[0];
    expect(xhr.method).toBe("POST");
    expect(xhr.url).toBe("/LAMPAPI/AddColor.php");
    expect(xhr.headers["Content-type"]).toBe("application/json; charset=UTF-8");
    expect(JSON.parse(xhr.body)).toEqual({ color: "Teal", userId: 0 });
  });

  test("shows a confirmation once the server answers 200", () => {
    const { app } = loadApp();
    document.getElementById("colorText").value = "Teal";

    app.addColor();
    expect(document.getElementById("colorAddResult").innerHTML).toBe("");

    FakeXHR.instances[0].respond(200, { error: "" });
    expect(document.getElementById("colorAddResult").innerHTML).toBe(
      "Color has been added"
    );
  });
});

describe("searchColor", () => {
  test("sends the search text and formats results one per line", () => {
    const { app } = loadApp();
    document.getElementById("searchText").value = "blue";

    app.searchColor();

    const xhr = FakeXHR.instances[0];
    expect(xhr.url).toBe("/LAMPAPI/SearchColors.php");
    expect(JSON.parse(xhr.body)).toEqual({ search: "blue", userId: 0 });

    xhr.respond(200, { results: ["Blue", "Light Blue"], error: "" });

    expect(document.getElementById("colorSearchResult").innerHTML).toBe(
      "Color(s) has been retrieved"
    );
    const list = document.getElementById("colorList");
    expect(list.innerHTML).toBe("Blue<br>\n" + "Light Blue");
    expect(list.querySelectorAll("br")).toHaveLength(1);
  });
});

describe("login form", () => {
  test("shows an error and stays on the page for a wrong password", () => {
    const { app, fakeWindow } = loadApp();
    document.getElementById("loginName").value = "testuser";
    document.getElementById("loginPassword").value = "wrong";

    app.doLogin();

    const xhr = FakeXHR.instances[0];
    expect(xhr.url).toBe("/LAMPAPI/Login.php");
    expect(JSON.parse(xhr.body)).toEqual({ login: "testuser", password: "wrong" });

    xhr.respond(200, { id: 0, firstName: "", lastName: "", error: "No Records Found" });

    expect(document.getElementById("loginResult").innerHTML).toBe(
      "User/Password combination incorrect"
    );
    expect(fakeWindow.location.href).toBe("");
  });

  test("saves the user in a cookie and opens color.html on success", () => {
    const { app, fakeWindow } = loadApp();
    document.getElementById("loginName").value = "testuser";
    document.getElementById("loginPassword").value = "testpass";

    app.doLogin();
    FakeXHR.instances[0].respond(200, {
      id: 7,
      firstName: "Test",
      lastName: "User",
      error: ""
    });

    expect(fakeWindow.location.href).toBe("color.html");
    expect(document.cookie).toContain("firstName=Test,lastName=User,userId=7");
    expect(app.getState()).toEqual({ userId: 7, firstName: "Test", lastName: "User" });
  });
});

describe("readCookie", () => {
  test("reads the user back from the login cookie", () => {
    document.cookie = "firstName=Ada,lastName=Lovelace,userId=42";
    const { app, fakeWindow } = loadApp();

    app.readCookie();

    expect(app.getState()).toEqual({ userId: 42, firstName: "Ada", lastName: "Lovelace" });
    expect(fakeWindow.location.href).toBe("");
  });

  test("sends the visitor back to the login page with no cookie", () => {
    const { app, fakeWindow } = loadApp();

    app.readCookie();

    expect(fakeWindow.location.href).toBe("index.html");
  });
});
