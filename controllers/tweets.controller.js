const Tweet = require('../models/tweet.model')
const Like = require('../models/like.model');

module.exports.list = (req, res, next) => {
  Tweet.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("user")
    .populate("comments")
    .populate("likes")
    .then((tweets) => {
      res.render("tweets/list", {
        tweets,
        user: req.currentUser
      });
    })
    .catch(next);
}

module.exports.like = (req, res, next) => {
  const params = { tweet: req.params.id, user: req.currentUser._id };

  Like.findOne(params)
    .then(like => {
      if (like) {
        Like.findByIdAndRemove(like._id)
          .then(() => {
            res.json({ like: -1 });
          })
          .catch(next);
      } else {
        const newLike = new Like(params);
        newLike.save()
          .then(() => {
            res.json({ like: 1 });
          })
          .catch(next);
      }
    })
    .catch(next);
}
