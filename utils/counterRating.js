const Rating = require('../model/rating');
const Review = require('../model/review');

// const counterRating = async (reviewId, userId) => {
//   // const ratingAuthorByUsers = [];

//   console.log('reviewsAuthor: ', idReviewsAuthor);
//   const array = counter(idReviewsAuthor);

//   if (array.length) {
//     console.log('rating by author: ', array);
//     const ratingAuthor = ratingAuthorByUsers.reduce(
//       (accumulator, currentValue) => accumulator + currentValue,
//     );
//   }

//   // if (ratingAuthorByUsers.length > 0) console.log('ratingAuthorByUsers', ratingAuthorByUsers);

//   return ratingAuthor;
// };

const counterRating = async (idReviewsAuthor) => {
  const ratingAuthorByUsers = [];

  await Promise.all(
    idReviewsAuthor.map(async (item) => {
      const rating = await Rating.findAll({ where: { idReview: item } });
      // console.log('rating: ', rating);
      if (rating.length > 0) {
        // console.log('rating asdasdas: ', rating[0].dataValues.rating);
        // console.log('item: ', item);

        // console.log('obj.dataValues.rating: ', obj.dataValues.rating);
        console.log('rating[0].dataValues.rating: ', rating[0].dataValues.rating);
        ratingAuthorByUsers.push(rating[0].dataValues.rating);
        // ratingAuthorByUsers.push(obj.dataValues.rating);
      }
    }),
  );
  const rating =
    ratingAuthorByUsers.reduce((accumulator, currentValue) => accumulator + currentValue) /
    ratingAuthorByUsers.length;

  // ratingAuthorByUsers.push(rating.dataValues.rating);

  // console.log('rating: ', rating);
  return rating;
};

module.exports = { counterRating };
