# Mongo CSV

### About application

<p>Script for download, parsing and inserting data to mongodb.</p>

### Required software
For the application to work correctly, you need to install the following software:
```
node.js lts
mongodb
```

### Pre-setup

Create a folder in the root of the project for downloading files
```
mkdir var
```

Сreate a .env file in the root directory and fill in your data in it, following the example below.
```
CLIENT_ID=xxxxxxx
CLIENT_SECRET=xxxxxxx
REDIRECT_URL=xxxxxxx
ACCESS_TOKEN=xxxxxxx
REFRESH_TOKEN=xxxxxxx
```

The data for .env can be taken from these links
```
https://console.cloud.google.com/apis/credential
https://developers.google.com/oauthplayground/
```
Select all points for work with google drive in oauthplayground.

### Build and run

Use following command in terminal for build and run script.
```
URL=URL_TO_MONGOBD_SERVER npm start
```

For example
```
URL=mongodb://172.17.0.3:27017/ npm start
```

Use following command in terminal for only build.
```
npm run build
```
