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
