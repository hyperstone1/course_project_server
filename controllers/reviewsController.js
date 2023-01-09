const ApiError = require('../error/ApiError');
const Review = require('../model/review');
const Tags = require('../model/tags');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const { fetchCoverImg, fetchImages } = require('../http/reviews/createReview');
const Likes = require('../model/likes');
const Rating = require('../model/rating');
const User = require('../model/user');
const { counterRating } = require('../utils/counterRating');
// const { validation } = require('../utils/validation');

class ReviewsController {
  async getImages(req, res) {
    try {
      await axios({
        method: 'POST',
        url: `https://api.dropboxapi.com/2/files/list_folder`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TOKEN}`,
        },
        data: {
          include_deleted: false,
          include_has_explicit_shared_members: false,
          include_media_info: false,
          include_mounted_folders: true,
          include_non_downloadable_files: true,
          path: '/Upload',
          recursive: false,
        },
      }).then((resp) => {
        res.send(resp.data);
        console.log(resp);
      });
    } catch (error) {
      res.json({ message: error.message });
    }
  }

  async addReview(req, res, next) {
    const { id, name, reviewType, title, tags, headers, texts, rating, bufferImgs, bufferCover } =
      req.body;
    try {
      const randomString = crypto.randomBytes(5).toString('hex');
      const stream = fs.createWriteStream(`./public/images/${randomString}.jpg`);
      if (bufferCover) {
        const image = Buffer.from(Object.values(bufferCover));
        console.log(rating);

        // console.log(image);

        stream.on('finish', async function () {
          console.log('file has been written');
          const urlCover = await fetchCoverImg(image);
          console.log('url cover image: ', urlCover);
          const imgsUrl = await fetchImages(
            bufferImgs,
            urlCover,
            reviewType,
            title,
            tags,
            headers,
            texts,
          );
          console.log('images array: ', imgsUrl);
          await Review.create({
            idUser: Number(id),
            userName: name,
            type: reviewType,
            title,
            tags,
            headers,
            text: texts,
            coverURL: urlCover,
            imagesURL: imgsUrl,
            likes: 0,
            rating,
          });
          if (tags) {
            const allTags = await Tags.findAll();
            console.log(allTags);
            await Promise.all(
              tags.map(async (tag) => {
                const tagExist = await Tags.findOne({ where: { tag } });
                if (!tagExist) {
                  await Tags.create({ tag: tag });
                }
              }),
            );
          }
          res.end('file has been written');
        });
      }
      stream.write(Buffer.from(JSON.stringify(bufferCover)), 'utf-8', function (err) {
        stream.end();
      });
      res.json('ok');
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  }

  async getPreviewById(req, res) {
    const { url } = req.body;
    try {
      await axios({
        method: 'POST',
        url: `https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TOKEN}`,
          // 'Dropbox-API-Arg': JSON.stringify({ path: '/Upload/966c17a8f9.jpg' }),
        },
        data: {
          path: '/Upload/966c17a8f9.jpg',
          settings: {
            access: 'viewer',
            allow_download: true,
            audience: 'public',
            requested_visibility: 'public',
          },
        },

        // responseType: 'blob',

        // data: {
        //   entries: [
        //     {
        //       format: 'jpeg',
        //       mode: 'strict',
        //       path: '/Upload/966c17a8f9.jpg',
        //       size: 'w64h64',
        //     },
        //   ],
        // },
      }).then((resp) => {
        console.log(resp.data);
        res.send(resp.data);
      });
      const coverImage = Review.findAll({
        where: {
          coverURL: url,
        },
      });
      res.send(coverImage);
    } catch (error) {
      console.log(error);

      res.json(400, error);
    }
  }

  async getMovies(req, res) {
    try {
      const reviews = await Review.findAll({
        where: {
          type: 'Кино',
        },
      });
      res.json({ data: reviews });
    } catch (error) {
      res.json(error);
    }
  }

  async getGames(req, res) {
    try {
      const reviews = await Review.findAll({
        where: {
          type: 'Игры',
        },
      });
      res.json({ data: reviews });
    } catch (error) {
      res.json(error);
    }
  }

  async getBooks(req, res) {
    try {
      const reviews = await Review.findAll({
        where: {
          type: 'Книги',
        },
      });
      res.json({ data: reviews });
    } catch (error) {
      res.json(error);
    }
  }

  async getMusic(req, res) {
    try {
      const reviews = await Review.findAll({
        where: {
          type: 'Музыка',
        },
      });
      res.json({ data: reviews });
    } catch (error) {
      res.json(error);
    }
  }

  async getAllReviews(req, res) {
    try {
      const reviews = await Review.findAll();
      res.json(reviews);
    } catch (error) {
      res.json(error);
    }
  }

  async getReviewById(req, res) {
    const { reviewId } = req.body;
    const reviewsContent = [];
    try {
      const reviews = await Review.findAll({
        where: {
          id: Number(reviewId),
        },
      });
      const text = await reviews[0].text.map((item) => JSON.parse(item));
      const headers = await reviews[0].headers.map((item) => JSON.parse(item));
      const imagesURL = await reviews[0].imagesURL.map((item) => JSON.parse(item));
      await text.map((item) => {
        if (item.text) {
          reviewsContent.push({ id: item.id, text: item.text, type: 'text' });
        }
      });
      await headers.map((item) => {
        if (item.header) {
          reviewsContent.push({ id: item.id, header: item.header, type: 'header' });
        }
      });
      await imagesURL.map((item) => {
        if (item.image) {
          reviewsContent.push({ id: item.id, url: item.image, type: 'image' });
        }
      });
      reviewsContent.sort(function (a, b) {
        if (a.id > b.id) {
          return 1;
        }
        if (a.id < b.id) {
          return -1;
        }
        return 0;
      });
      res.json({ data: reviews, text, headers, imagesURL, reviewsContent });
    } catch (error) {
      res.json(error);
    }
  }

  async getReviewsByUser(req, res) {
    const { id } = req.body;
    try {
      const reviews = await Review.findAll({
        where: {
          idUser: id,
        },
      });
      res.json({ reviews });
    } catch (error) {
      res.json({ message: error.message });
    }
  }

  async getTags(req, res) {
    try {
      const tags = await Tags.findAll();
      res.json(tags);
    } catch (error) {
      res.json({ message: error.message });
    }
  }

  async updateReview(req, res) {
    const review = { coverURL: '', imagesURL: [] };
    const {
      reviewId,
      reviewType,
      title,
      tags,
      headers,
      texts,
      rating,
      bufferImgs,
      bufferCover,
      imagesTool,
      previewCover,
    } = req.body;
    try {
      const newUrlCover = null;
      const imagesURL = [];
      const images = [];
      review.coverURL = previewCover;

      const reviewById = await Review.findAll({
        where: {
          id: reviewId,
        },
      });
      console.log('review:  ', reviewById[0].dataValues.id);
      reviewById[0].dataValues.imagesURL.map((item) => {
        images.push(JSON.parse(item));
        console.log('reviewById: ', reviewById);
      });
      if (previewCover === reviewById[0].coverURL) {
        review.coverURL = previewCover;
        console.log('previewCover: ', previewCover);
      } else {
        if (bufferCover) {
          const image = Buffer.from(Object.values(bufferCover));
          newUrlCover = await fetchCoverImg(image);
          // const imgsUrl = null;
          console.log('url cover image: ', newUrlCover);
        }
      }
      await imagesTool.map((image) => {
        if (image.url.substring(0, 5) === 'https') {
          console.log('image.url 1: ', image.url);
          review.imagesURL.push({ id: image.id, image: image.url });
        }
      });

      console.log('images: ', images);

      console.log('imagesURL: ', imagesURL);
      console.log('review.imagesURL: ', review.imagesURL);
      console.log('bufferImgs.length: ', bufferImgs.length);
      if (bufferImgs.length > 0) {
        const newImgsUrl = await fetchImages(bufferImgs);
        console.log('images array: ', newImgsUrl);
        newImgsUrl.map((image) => {
          review.imagesURL.push(image);
        });
      }
      console.log('review.imagesURL: ', review.imagesURL);

      const newReview = await Review.update(
        {
          type: reviewType,
          title,
          tags,
          headers,
          text: texts,
          coverURL: review.coverURL,
          imagesURL: review.imagesURL,
          likes: 0,
          rating,
        },
        {
          where: { id: reviewId },
        },
      );
      console.log('reviewId: ', newReview);

      if (tags) {
        const allTags = await Tags.findAll();
        console.log(allTags);
        await Promise.all(
          tags.map(async (tag) => {
            const tagExist = await Tags.findOne({ where: { tag } });
            if (!tagExist) {
              await Tags.create({ tag: tag });
            }
          }),
        );
      }
      console.log('newReview!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!: ', newReview);
      res.json({ data: newReview });
    } catch (error) {
      res.json(error);
    }
  }

  async getLikesByReview(req, res) {
    const { id } = req.body;
    try {
      const reviewLikes = await Likes.findAll({ where: { idReview: id } });

      res.json(reviewLikes);
    } catch (error) {
      res.json(error);
    }
  }

  async rateReviewByUser(req, res) {
    const { reviewId, userId, rating } = req.body;
    try {
      const reviewRating = await Rating.findAll({ where: { idReview: reviewId, idUser: userId } });
      const authorReview = await Review.findOne({ where: { id: reviewId } });

      if (reviewRating.length > 0) {
        const ratingAuthorByUsers = [];
        await Rating.update({ rating }, { where: { idReview: reviewId, idUser: userId } });
        const idReviewsAuthor = [];

        const reviewsAuthor = await Review.findAll({
          where: { idUser: authorReview.dataValues.idUser },
        });
        reviewsAuthor.map((item) => {
          idReviewsAuthor.push(item.dataValues.id);
        });
        const ratingAuthor = await counterRating(idReviewsAuthor);
        console.log('ratingAuthor: ', ratingAuthor);
        const user = await User.update(
          { rating: ratingAuthor },
          { where: { id: authorReview.dataValues.idUser } },
        );
        console.log(user);
        res.json('successfully updated');
      } else {
        await Rating.create({ idUser: userId, idReview: reviewId, rating });
        req.json('Successfuly added');
      }
    } catch (error) {
      res.json(error);
    }
  }
  async reviewRatingByUser(req, res) {
    const { reviewId, userId } = req.body;
    try {
      const reviewRating = await Rating.findAll({ where: { idReview: reviewId, idUser: userId } });
      console.log(reviewRating.length);
      if (reviewRating.length > 0) {
        console.log(reviewRating[0]);
        res.json(reviewRating[0].dataValues.rating);
      } else {
        res.json('not rated');
      }
    } catch (error) {
      res.json(error);
    }
  }
}

module.exports = new ReviewsController();
