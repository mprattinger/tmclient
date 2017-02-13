"use strict";

var nedb = require("nedb");
var path = require("path");
var q = require("q");
var winston = require("winston");

class DatabaseService {

    constructor() {
        this._dbPath = path.join(__dirname, "tmclient.db");
        this.db = new nedb({
            "filename": this._dbPath,
            "autoload": true
        });
    }

    storeUnknownCard(cardId) {
        var deferred = q.defer();

        winston.info("Storing unknown card with id " + cardId);

        var doc = {
            "cardId": cardId
        }

        winston.info("Checking if unknown card already in the store...");

        this.db.findOne({ "cardId": cardId }, (err, res) => {
            if (err) {
                winston.error("Error searching for cardid in the store!", err);
                deferred.reject(err);
                return;
            }
            if (res == null) {
                winston.info("CardId " + cardId + " not found in the store! Saving data...");
                this.db.insert(doc, (err, newdoc) => {
                    if (err) {
                        winston.error("Error saving cardid " + cardId + " in the store!", err);
                        deferred.reject(err);
                        return;
                    }
                    winston.info("CardId successfully stored in store!");
                    deferred.resolve(newdoc);
                });
            } else {
                winston.info("CardId " + cardId + " found in store. No need to store the card!");
            }
        });

        return q.promise;
    }
}

module.exports = DatabaseService;