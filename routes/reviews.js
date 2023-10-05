const express = require('express');
const router = express.Router({mergeParams:true});
const catchAsync= require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const reviews = require('../controllers/reviews')

const Campground = require('../models/campground');

const Review = require('../models/review')

const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')



router.post('/',isLoggedIn, validateReview,catchAsync(reviews.createReviews))
// /campgrounds/id/reviews/reviewId

//Reviews delete route
router.delete('/:reviewId',isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReviews))

module.exports=router;
