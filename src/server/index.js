var createError = require('http-errors');
const express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const { Client } = require('pg');
var logger = require('morgan');
const connectionString = 'postgres://drewwinget:drewwinget@localhost:5432/sentences';
const vConnectionString = 'postgres://verbsadmin:@localhost:5432/verbos';
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : null,
  database : 'omegawiki',
  insecureAuth: true
});

// connection.connect();

// connection.query(
//   'SELECT * FROM uw_expression WHERE expression_id IN(SELECT expression_id FROM uw_syntrans WHERE defined_meaning_id IN(SELECT defined_meaning_id FROM uw_syntrans WHERE expression_id IN(SELECT expression_id FROM uw_expression WHERE spelling = "hola"))) AND language_id = 85', function (error, results, fields) {
//   if (error) throw error;
//     console.log(results.map(result => result.spelling.toString()));
// });

// connection.end();

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var regionsRouter = require('./routes/regions');
// var annotationsRouter = require('./routes/annotations');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../dist')));
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
// app.use('/regions', regionsRouter);
// app.use('/annotations', annotationsRouter);

// POSTGRESQL CONNEXION - Sentences
const client = new Client({
  connectionString: connectionString
});
client.connect();

// POSTGRESQL CONNEXION - Verbs
const vClient = new Client({
  connectionString: vConnectionString
});
vClient.connect();

// Routes
app.get('/sentences/:source', function (req, res, next) {
  const source = req.params.source;
  console.log(req.params.source);
  client.query(`SELECT * FROM corpus_sentences WHERE source = '${source}'`, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    res.status(200).send(result.rows);
  });
});

app.get('/sentences', function (req, res, next) {
  client.query(`SELECT * FROM sentences`, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    res.status(200).send(result.rows);
  });
});

app.post('/sentences', function(req, res, next) {
  console.log(req.body.chars);
  client.query(
    `INSERT INTO sentences (chars, created_on) VALUES ('${req.body.chars}', current_timestamp)`,
    function (err, result) {
      if (err) {
        console.log(err);
        res.status(400).send(err);
      }
      res.status(200).send(result.rows);
    });
});

app.get('/verbs', function (req, res, next) {
  vClient.query('SELECT * FROM verbs', function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    res.status(200).send(result.rows);
  });
});

app.get('/verbs/:form', function(req, res, next) {
  const form = req.params.form;
  vClient.query(
    `SELECT * FROM verbs WHERE form_1s = '${form}'
 OR  form_2s = '${form}' OR form_3s = '${form}' OR form_1p = '${form}' OR form_2p = '${form}' OR form_3p = '${form}' OR infinitive = '${form}'`,
    function (err, result) {
      if (err) {
        console.log(err);
        res.status(400).send(err);
      }
      res.status(200).send(result.rows);
    });
});

app.get('/tense/:verb/:tense', function(req, res, next) {
  let tense = req.params.tense;
  let verb = req.params.verb;
  tense = tense.charAt(0).toUpperCase() + tense.slice(1);

  console.log(verb);
  console.log(tense);

  vClient.query(
    `SELECT * FROM verbs WHERE infinitive = '${verb}' AND tense = '${tense}'`,
    function (err, result) {
      if (err) {
        console.log(err);
        res.status(400).send(err);
      }
      res.status(200).send(result.rows);
    });
});

app.post('/glosses', function (req, res, next) {
  let words = req.body.words;
  const wordsString = words.reduce((acc, curr, index, wordsArray) => {
    return `${acc}'${curr}'${ (index < wordsArray.length - 1) ? ', ' : ''}`;
  }, '');
  client.query(
    `SELECT chars, meanings_chars FROM words WHERE chars IN(${wordsString})`, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    res.status(200).send(result.rows);
  });
});

// app.post('/glosses', function (req, res, next) {
//   let words = req.body.words.map(word => ({
//     chars: word,
//     translation: ''
//   }));

//   console.log(words);
//   connection.connect();
//   connection.query(
//     `SELECT * FROM uw_expression WHERE expression_id IN(SELECT expression_id FROM uw_syntrans WHERE defined_meaning_id IN(SELECT defined_meaning_id FROM uw_syntrans WHERE expression_id IN(SELECT expression_id FROM uw_expression WHERE spelling = "${words[0].chars}"))) AND language_id = 85 LIMIT 1`, function (error, results, fields) {
//       if (error) {
//         console.log(err);
//         res.status(400).send(err);
//       };
//       if (results[0]) {
//         words[0].translation = results[0].spelling.toString();
//         res.status(200).send(words);
//       } else {
//         res.status(200).send(words);
//       }
//       connection.end();
//     });
// });

// app.get('/form/:person/:number/:tense/:mood/:verb', function(req, res, next) {
//   let person = req.params.person;
//   let number = req.params.number;
//   let tense = req.params.tense;
//   let mood = req.params.mood;
//   let verb = req.params.verb;

//   tense = tense.charAt(0).toUpperCase() + tense.slice(1);
//   vClient.query(
//     `SELECT * FROM verbs WHERE infinitive = '${verb}' AND tense = '${tense}'`,
//     function (err, result) {
//       if (err) {
//         console.log(err);
//         res.status(400).send(err);
//       }
//       res.status(200).send(result.rows);
//     });
// });

app.get('/', function(req, res){
  res.sendFile(path.resolve('../../dist/index.html'));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

app.listen(4000, function () {
  console.log('Server is running.. on Port 4000');
});

// ROUTES

// SENTENCES
// Insert new Sentence
// INSERT INTO sentences (chars, created_on) VALUES ('Hola; ¿Cómo te llamas?', current_timestamp);

// Show all sentences
// SELECT * FROM sentences

// Add tag to sentence

// Link Instance Sentence

// Get Sentence by Type

// Get sentence by adjacency signature ("now tell me in the preterite")

// Show building heuristic of the sentence

// Get sound source for sentence

// Show distinct clause patterns

// RULES/HEURISTICS
// Add new rule

// Update rule explanation

// Link sentence to rule

// Claim that one rule depends on another

// each word, phrase, or scaffold has a terse translation, a slightly-deeper translation, and a full report.
// The full report should include all other meanings of the exact expression, with
// dozens of example sentences (a collocation stellate),
// AND AN EXPLANATION OF WHY THAT MEANING ***CAN'T*** apply in this case.
// Cataloging scaffolds.
