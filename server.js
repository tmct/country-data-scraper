var express = require('express');
var rp = require('request-promise');
var cheerio = require('cheerio');
var app     = express();
var _ = require('lodash');

app.get('/', function(req, res) {
    return getCountryCodes(req, res);
});

function getCountryCodes(req, res) {
    return getCountryCodeData()
    .then(function(data) {
        returnCountryCodeJson(data, res);
    })
    .catch(function(error) {
        res.status(500).send(error.message);
    });
}

function getCountryCodeData() {
    var url = 'https://countrycode.org/'
    return rp(url)
    .catch(function() {
        throw new Error("Could not access country code site");
    })
    .then(function(html){
        var $ = cheerio.load(html);
        var countryRows = $('tr').eq(1).parent().children('tr');
        return _.map(countryRows, function(countryRow) {
            return getCountryData($(countryRow));
        });
    });
}

function getCountryData(countryRow) {
    var country = {}
    var countryNameData = countryRow.children().first();
    country.name = countryNameData.children('a').html();

    var countryDiallingCodeData = countryNameData.next();
    country.diallingCodes = countryDiallingCodeData.html().split(', ');

    var countryIsoCodeData = countryDiallingCodeData.next();
    var isoCodes = countryIsoCodeData.html();
    var isoCode = isoCodes.substring(0, isoCodes.indexOf(' '));
    country.isoCode = isoCode;

    return country;
}

function returnCountryCodeJson(data, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data));
}

app.listen('8081');

exports = module.exports = app;
