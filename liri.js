require("dotenv").config();
const keys = require("./keys.js");
const command = process.argv[2];
const commandArgument = process.argv.slice(3, process.argv.length).join(" ");
const fs = require('fs');

logText('\ncommand: ' + command + '\t|\targument: ' + commandArgument + '\n', 0, 1);
route(command, commandArgument);


function logText(logText, consoleLog = 1, fileLog = 1) {
    if (consoleLog) console.log(logText);
    if (fileLog) {
        fs.appendFile('liri-log.txt', logText, 'utf8', function (err) {
            if (err) console.log(err);
        });
    }
}

function getTweets(handle = 0) {
    const handleName = handle ? handle : "codeforprogress";
    const Twitter = require('twitter');
    const twitterClient = new Twitter(keys.twitter);
    const params = {
        screen_name: handleName,
        count: 20
    };
    twitterClient.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            let response = JSON.stringify(tweets);
            response = JSON.parse(response);
            logText("\n\n\n========================================\n\t" + handleName + "'s most recent 20 tweets\n========================================\n   date\t\t|\ttweet\n========================================", 1, 0);

            for (let i = 0, responseLength = response.length; i < responseLength; i++) {
                logText(response[i].created_at.substring(4, 11) + response[i].created_at.substr(-4) + '\t|\t' + response[i].text, 1, 1);
                logText('\n',0,1);
            }
            logText('\n',1,1);
        }
    });
}

function getSong(song = 0) {
    const songName = song ? song : "The Sign Ace of Base";
    const Spotify = require('node-spotify-api');
    const spotifyClient = new Spotify(keys.spotify);
    spotifyClient.search({
        type: 'track',
        query: songName
    }, function (err, data) {
        if (err) {
            return logText('Error occurred: ' + err,0,1);
        }
        response = data;
        logText('\n\n\n========================================\n\t' + response.tracks.items[0].name + ' Info\n========================================', 1,0);
        logText('Artist:\t\t\t' + response.tracks.items[0].artists[0].name + '\nSong Name:\t\t' + response.tracks.items[0].name + '\nPreview URL:\t\t' + response.tracks.items[0].preview_url + '\nAlbum:\t\t\t' + response.tracks.items[0].album.name + '\n\n',1,1);
    });
}

function getMovie(movie = 0) {
    const movieName = movie ? movie : "Mr. Nobody";
    const request = require("request");
    const queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=" + keys.omdb.api_key;
    request(queryUrl, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            response = JSON.parse(body);
            // breaks if no rotten tomatoe score in OMDB
            const rottenTomatoes = response.Ratings.find(rating => rating.Source === 'Rotten Tomatoes');
            let rottenTomatoesScore = rottenTomatoes ? rottenTomatoes.Value : "-";
            logText('\n\n\n========================================\n\t\t' + response.Title + ' Info\n========================================', 1,0);
            logText('Title:\t\t\t' + response.Title + '\nYear:\t\t\t' + response.Year + '\nIMDB Rating:\t\t' + response.imdbRating + '\nRotten Tomatoe Score:\t' + rottenTomatoesScore + '\nCountry:\t\t' + response.Country + '\nLanguage:\t\t' + response.Language + '\nPlot:\t\t\t' + response.Plot + '\nActors:\t\t\t' + response.Actors + '\n\n',1,1);
        } else {
            logText(response.statusCode + '\n',0,1);
        }
    });
}

function commandFromFile() {
    const fs = require('fs');
    const file = "random.txt";
    fs.readFile(file, "utf8", function (err, data) {
        if (err) {
            return logText("file read error was " + err + '\n',0,1)
        }
        var dataArr = data.split(",");
        if (dataArr[0] !== 'do-what-it-says') {
            route(dataArr[0], dataArr[1])
        }
    });
}

function route(command, commandArgument) {
    switch (command) {
        case 'my-tweets':
            getTweets(commandArgument);
            break;
        case 'spotify-this-song':
            getSong(commandArgument);
            break;
        case 'movie-this':
            getMovie(commandArgument);
            break;
        case 'do-what-it-says':
            commandFromFile();
            break;
        default:
            logText("I'm sorry, I can't " + command + '\n',1,1);
    }
}