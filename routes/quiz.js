var express = require('express');
var quiz = require('../models/quiz');
var errorMessage = require('../config/error_message');
var passport = require('../components/passport');

var router = module.exports = express.Router();

/** クイズ画面 */
router.get('/',
  passport.isLogined,
  function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();

    quiz.findRandom().then(function(quiz) {
      req.session.quiz = {id: quiz.quiz_id};
      res.render('quiz', {quiz: quiz});
    }).catch(function(err) {
      next(err);
    });
  });

/** クイズ解答 */
router.post('/answer',
  passport.isLogined,
  function(req, res, next) {
    // req.body.choice.length < 10 はとりあえず長い文字列弾く
    if (!(req.session.quiz && req.session.quiz.id && req.body.choice && req.body.choice.length < 10)) {
      var err = new Error(errorMessage.BAD_REQUEST);
      err.status = 400;
      return next(err);
    }

    var quizId = req.session.quiz.id;
    req.session.quiz = null;
    var choice = req.body.choice;

    quiz.checkAnswer(quizId, choice, req.user).then(function(ret) {
      if (ret.point) {
        ret.user.display_name = res.locals.user.display_name;
        res.render('quiz_correct', ret);
      } else {
        res.render('quiz_incorrect', ret);
      }
    }).catch(function(err) {
      next(err);
    });
  });
