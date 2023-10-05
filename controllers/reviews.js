const Campground = require('../models/campground');
const Review = require('../models/review')

module.exports.createReviews=async (req,res)=>{
    // console.log(req.params)
    //res.send('You made it!!')
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Created new review');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReviews=async (req,res)=>{
    const{id, reviewId}=req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId} });
    await Review.findByIdAndDelete(reviewId);
    //res.send("Delete Me!!!")
    req.flash('success','Succesfully deleted a review');
    res.redirect(`/campgrounds/${id}`);
}