const mongoose = require('mongoose');
const Review= require('./review')
const Schema=mongoose.Schema;
//to set the mongoose.Schema to an easier variable

//https://res.cloudinary.com/dbfayalcf/image/upload/v1687963125/YelpCamp/prbf2vhjkqroazlg6jri.jpg

// Set the schema
const ImageSchema= new Schema({
    url:String,
    filename: String

})

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload',"/upload/w_200");
})

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [
        
       ImageSchema    
    ],
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },

    
    price: Number,
    description: String,
    location: String,
    author:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },

    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'

        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

CampgroundSchema.post('findOneAndDelete', async function(doc) {
   
    if(doc){
        await  Review.deleteMany({
            _id:{
                $in:doc.reviews 
            }
        })
            
                
           
        
        //console.log(res)
    }
    //console.log("Moddle ware executed")
})
    
// if(farm.products.length){
//     const res = await Product.deleteMany({_id:{$in:farm.products}})
//     console.log(res)
// }


// export to the app.js so the database can read it and define the model
module.exports= mongoose.model('Campground', CampgroundSchema);
