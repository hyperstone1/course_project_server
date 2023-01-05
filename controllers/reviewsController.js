const ApiError = require('../error/ApiError');
const Review = require('../model/review');
const Tags = require('../model/tags');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const { fetchCoverImg, fetchImages } = require('../http/reviews/createReview');

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
    const { id, reviewType, title, tags, headers, texts, bufferImgs, bufferCover } = req.body;
    try {
      const randomString = crypto.randomBytes(5).toString('hex');

      const stream = fs.createWriteStream(`./public/images/${randomString}.jpg`);
      if (bufferCover) {
        const image = Buffer.from(bufferCover);
        console.log(image);

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
            idUser: id,
            type: reviewType,
            title,
            tags,
            headers,
            text: texts,
            coverURL: urlCover,
            imagesURL: imgsUrl,
            likes: 0,
            idComments: [0],
          });
          if (tags) {
            tags.map(async (tag) => {
              await Tags.create({
                tag,
              });
            });
          }
          res.end('file has been written');
        });
      }
      stream.write(Buffer.from(bufferCover), 'utf-8', function (err) {
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

      res.json(error);
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

  async getTags(req, res) {
    try {
      const tags = await Tags.findAll();
      res.json([{ title: 'clock' }, { title: 'alert' }, { title: 'login' }]);
    } catch (error) {
      res.json({ message: error.message });
    }
  }
}

module.exports = new ReviewsController();
