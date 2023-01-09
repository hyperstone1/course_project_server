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
const Comments = require('../model/comments');

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
      });
    } catch (error) {
      res.json({ message: error.message });
    }
  }

  async addReview(req, res, next) {
    const { id, name, reviewType, title, tags, headers, texts, rating, bufferImgs, bufferCover } =
      req.body;
    try {
      if (bufferCover) {
        const image = Buffer.from(Object.values(bufferCover));

        stream.on('finish', async function () {
          const urlCover = await fetchCoverImg(image);
          const imgsUrl = await fetchImages(
            bufferImgs,
            urlCover,
            reviewType,
            title,
            tags,
            headers,
            texts,
          );
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
            await Promise.all(
              tags.map(async (tag) => {
                const tagExist = await Tags.findOne({ where: { tag } });
                if (!tagExist) {
                  await Tags.create({ tag: tag });
                }
              }),
            );
          }
        });
      }
      res.json('ok');
    } catch (error) {
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
      }).then((resp) => {
        res.send(resp.data);
      });
      const coverImage = Review.findAll({
        where: {
          coverURL: url,
        },
      });
      res.send(coverImage);
    } catch (error) {
      res.json(400, error);
    }
  }

  async getMovies(req, res) {
    try {
      const reviews = await Review.findAll({
        where: {
          type: 'Movies',
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
          type: 'Games',
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
          type: 'Books',
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
          type: 'Music',
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
      existRating,
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
      reviewById[0].dataValues.imagesURL.map((item) => {
        images.push(JSON.parse(item));
      });
      if (previewCover === reviewById[0].coverURL) {
        review.coverURL = previewCover;
      } else {
        if (bufferCover) {
          const image = Buffer.from(Object.values(bufferCover));
          newUrlCover = await fetchCoverImg(image);
        }
      }
      await imagesTool.map((image) => {
        if (image.url.substring(0, 5) === 'https') {
          review.imagesURL.push({ id: image.id, image: image.url });
        }
      });
      if (bufferImgs.length > 0) {
        const newImgsUrl = await fetchImages(bufferImgs);
        newImgsUrl.map((image) => {
          review.imagesURL.push(image);
        });
      }
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
          rating: existRating,
        },
        {
          where: { id: reviewId },
        },
      );
      if (tags) {
        const allTags = await Tags.findAll();
        await Promise.all(
          tags.map(async (tag) => {
            const tagExist = await Tags.findOne({ where: { tag } });
            if (!tagExist) {
              await Tags.create({ tag: tag });
            }
          }),
        );
      }
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
        const idReviewsAuthor = [];
        await Rating.update({ rating }, { where: { idReview: reviewId, idUser: userId } });
        const reviewsAuthor = await Review.findAll({
          where: { idUser: authorReview.dataValues.idUser },
        });
        reviewsAuthor.map((item) => {
          idReviewsAuthor.push(item.dataValues.id);
        });
        const ratingAuthor = await counterRating(idReviewsAuthor);
        const user = await User.update(
          { rating: ratingAuthor },
          { where: { id: authorReview.dataValues.idUser } },
        );
        res.json('successfully updated');
      } else {
        const idReviewsAuthor = [];
        await Rating.create({ idUser: userId, idReview: reviewId, rating });
        const reviewsAuthor = await Review.findAll({
          where: { idUser: authorReview.dataValues.idUser },
        });
        reviewsAuthor.map((item) => {
          idReviewsAuthor.push(item.dataValues.id);
        });
        const ratingAuthor = await counterRating(idReviewsAuthor);
        const user = await User.update(
          { rating: ratingAuthor },
          { where: { id: authorReview.dataValues.idUser } },
        );
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
      if (reviewRating.length > 0) {
        res.json(reviewRating[0].dataValues.rating);
      } else {
        res.json('not rated');
      }
    } catch (error) {
      res.json(error);
    }
  }

  async findMatches(req, res) {
    const { sentence } = req.body;
    try {
      const matchesSentence = [];
      const allReviews = await Review.findAll();
      allReviews.map((item) => {
        if (item.dataValues.title.toLowerCase().includes(sentence)) {
          matchesSentence.push({ id: item.dataValues.id, result: item.dataValues.title });
        }
        item.dataValues.text.map((obj) => {
          if (JSON.parse(obj).text.includes(sentence)) {
            matchesSentence.push({ id: item.dataValues.id, result: JSON.parse(obj).text });
          }
        });
        if (item.dataValues.headers.length > 0) {
          item.dataValues.headers.map((obj) => {
            if (JSON.parse(obj).header.includes(sentence)) {
              matchesSentence.push({ id: item.dataValues.id, result: JSON.parse(obj).text });
            }
          });
        }
      }),
        res.json(matchesSentence);
    } catch (error) {
      res.json(error);
    }
  }
  async getComments(req, res) {
    const { idReview } = req.body;
    try {
      const comments = await Comments.findAll({ where: { idReview } });

      res.json(comments);
    } catch (error) {
      res.json(error);
    }
  }
  async sendComment(req, res) {
    const { reviewId, userId, name, comment } = req.body;
    try {
      const comments = await Comments.create({
        idReview: Number(reviewId),
        idUser: userId,
        username: name,
        comment,
      });
      res.json(comments);
    } catch (error) {
      res.json(error);
    }
  }
}

module.exports = new ReviewsController();
