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
            "cardId": cardId,
            "lastTry": new Date()
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

    getUnknownCards() {
        var deferred = q.defer();

        winston.info("Load all unknown cardIds from database store!");

        this.db.find({}, (err, res) => {
            if (err) {
                winston.error("Error loading all cardids from the store!", err);
                deferred.reject(err);
                return;
            }

            winston.info("Found " + res.length + " cards in database!");
            deferred.resolve(res);
        });

        return deferred.promise;
    }

    getUnknownCard(id) {
        var deferred = q.defer();

        winston.info("Load all unknown cardIds from database store!");

        this.db.findOne({"card" : id}, (err, res) => {
            if (err) {
                winston.error("Error loading card with id " + id + " from the store!", err);
                deferred.reject(err);
                return;
            }

            winston.info("Found card " + res + " in database");
            deferred.resolve(res);
        });

        return deferred.promise;
    }
}

module.exports = DatabaseService;