## Metgo

A destination management application for internal and external tourism

</br>

## Tech stack

- Nest Js
- Node Js
- Flutter

## install Dependencies

clone the repo and use `cd backend ` and run the following command to install dependencies and current version of node Node Version Manger (nvm) will select the project's current node version from the `.nvmrc` files in the root directory.

```bash
nvm install
nvm use
yarn install
```

## getting started using a local backend, and local postgress database

These are the steps to run database migrations on a new database.

**Creating a new database**

1. if youdont't have postgresql intalled, please intall postgresql. You can do this on Mac via homeBrew with:

```
brew install postresql@14
```

2. Then start the postgres with the command (if postgress was already running, you'll need to restart it with `brew services restart postgresql@14`):

```
brew services start postgresql@14
```

open the postgress shell with one of these commands:

`psql postgres` or ` sudo -u postgres psql`

then create the database through the posrgres shell as per below. The postgres shell has a promt like this ` postgres=#`

create database metgo
create user metgo with encrypted password metgo
grand all privileges on database metgo to metgo

Then, you can verify the database was create like this:

```
\l
```

This will allow you to quit"

```
\q
```

Once the database is created , next we will setup the connection to the database. Note that if you would like to use different database name or password, thoese xhnage will need to reflected in your variables.

</br>

**Setuo environment Variables:**

from the directory `backend` copy the `local.env.example` file and rename it `local.env` (which is be ignored by Git):

```bash

cp local.env.example local.env

```

open `local.env` and asked your lead developer for the missing API key value variables:

**Importnat Note:** for every new instance of a ./backend terminal going forard, you will neeed to run the command `export DEV_CONFIG=local` before starting the backend. This will allow the config.services.ts (backend configuration file) to detect your environment variables' credentail and then connect to the database. Also note that if your .env files is named differentlt (examples: local.test.env), replace `local` with the name (example `local.test.env`).

## run the database migrations

## runnning the app

Now that our database is setup, run the following to start the backend. Remember that `local` should match the name of your current .env files.

```bash
export DEV_CONFIG=local
yarn start:dev
```
