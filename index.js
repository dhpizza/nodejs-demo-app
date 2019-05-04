
var express = require('express');
var os = require('os');
const Sequelize = require('sequelize');


var app = express();


var db_host = process.env.DB_HOST;
var db_db   = process.env.DB_DB;
var db_user = process.env.DB_USER;
var db_pass = process.env.DB_PASS;


app.get('/list', function(req, res) {
    var output = "<pre>";
    const sequelize = new Sequelize(db_db, db_user, db_pass, {
        dialect: 'mysql',
        host: db_host
    });

    const Entry = sequelize.define('entry', {
        ip: {
            type: Sequelize.STRING,
            allowNull: true
        }
    },{});


    sequelize.authenticate()
    .then(() => {
        console.log("Connection to database successfully started.");
        output += "DB connection OK\n";
        Entry.sync().then(() => {
            Entry.findAll().then(entries => {
                output += "Entries:\n";
                for (var i = 0; i < entries.length; i++) {
                    output += "    " + JSON.stringify(entries[i], null, 4) + "\n";
                }
                Entry.create({ip: req.ip}).then(entry => {
                    output += "appended new entry with id " + entry.id;
                    res.send(output + "</pre>");
                })
                .catch(err => {
                    output += "failed to append new entry" + err;
                    res.send(output + "</pre>");
                });
            })
            .catch(err => {
                output += "failed to retrieve entries: " + err;
                res.send(output + "</pre>");
            });
        })
        .catch(err => {
            output += "failed to sync model" + err;
            res.send(output + "</pre>");
        });
    })
    .catch(err => {
        res.send("Unable to connect to database:" + err);
    });

});

app.get('/', function (req, res) {
  res.send("Hello World from NodeJS!\nHostname: "+os.hostname());
});

app.listen(8080, function () {
  console.log('App listening on port 8080!');
});


