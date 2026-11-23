# COLORS

COLORS is a small web application from the COP 4331 LAMP lab. A user logs in, then adds colors and searches the colors saved for that account. Each person only sees the colors tied to their own user id.

The pages live in `public/`. The PHP API lives in `api/`. On the server those API files are served from `/LAMPAPI`, which is the path the browser calls.

## Technologies

- HTML, CSS, and JavaScript
- PHP
- MySQL
- Apache on Linux (the LAMP stack)

`public/js/md5.js` is a third-party MIT-licensed library (Sebastian Tschan). Password hashing in the login page is present but commented out, so the API compares the password string stored in the database.

## Setup

The application is hosted on a DigitalOcean droplet with Apache, MySQL, and PHP already installed. The domain [acsah.app](https://acsah.app) points at that droplet. The `COP4331` database, including the `Users` and `Colors` tables, was created on that server during the lab.

On the server, the web pages are in `/var/www/html/` and the API is in `/var/www/html/LAMPAPI/`.

Database credentials are not stored in this repository. To connect the API on a server, copy `api/db-config.example.php` to `api/db-config.php` and fill in the MySQL host, username, password, and database name. `api/db-config.php` is listed in `.gitignore` and must stay uncommitted.

## Run and access

Apache and MySQL are already running on the droplet. Open the site in a browser:

[https://acsah.app](https://acsah.app)

Log in with a username and password that already exists in the `Users` table. A successful login opens `color.html`. Search returns colors whose names contain the text you typed. Add Color stores a new name for the logged-in user. Log Out returns to the login page.

## Assumptions and limitations

- There is no registration page. Users are inserted into MySQL directly.
- There are no endpoints to edit or delete a color.
- Login state is stored in a browser cookie for 20 minutes. It is not a server session.
- The browser calls the API at `/LAMPAPI` on the same host as the HTML pages.
- An empty search match returns an error payload, so the page may not show a clean "none found" message.
- `public/images/background.png` is part of the original lab files and is not used by the stylesheet.

## AI usage

The application behavior comes from the existing COP 4331 COLORS lab code. Cursor was used to organize that code into this repository layout, move the database password out of the PHP files into `api/db-config.php`, and draft this README and the MIT license.

## Continuous Integration

Every push and pull request runs the **CI** workflow in GitHub Actions
(`.github/workflows/ci.yml`). Node.js is used only to install and run the
lint and test tools; the app itself still runs on the LAMP stack.

The workflow has two jobs:

1. **Lint** checks the front end:

   | Files | Linter | Config |
   | --- | --- | --- |
   | `public/**/*.html` | HTMLHint | `.htmlhintrc` |
   | `public/**/*.css` | Stylelint (`stylelint-config-standard`) | `.stylelintrc.json` |
   | `public/js/**/*.js`, `tests/**/*.js` | ESLint (`@eslint/js` recommended) | `eslint.config.js` |

   `public/js/md5.js` is a third-party library (blueimp JavaScript-MD5) and is
   left out of ESLint.

2. **Tests** run with Jest (`jest.config.js`):

   - **Unit tests** (`tests/unit/`) load `public/js/code.js` in a jsdom
     browser environment with a fake `XMLHttpRequest`. They check the JSON
     the login, add-color and search forms send, how search results are
     formatted on the page, and how the login cookie is read.
   - **Integration tests** (`tests/integration/`) make real HTTP requests to
     the PHP endpoints. The workflow starts a MySQL 8 service, loads
     `tests/sql/schema.sql`, writes a CI-only `api/db-config.php`, and serves
     `api/` with PHP's built-in server. The tests check the status code,
     content type and JSON structure returned by `Login.php`,
     `SearchColors.php` and `AddColor.php`.

To run the same checks locally:

```bash
npm install
npm run lint
npm run test:unit
# Integration tests need the API running against a database loaded with
# tests/sql/schema.sql, e.g. `php -S 127.0.0.1:8000 -t api`:
npm run test:integration
```
