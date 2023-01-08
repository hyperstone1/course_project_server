const axios = require('axios');
const crypto = require('crypto');
const Review = require('../../model/review');
const Tags = require('../../model/tags');

const fetchCoverImg = async (image) => {
  const randomString = crypto.randomBytes(5).toString('hex');

  const response = await axios
    .post(`https://content.dropboxapi.com/2/files/upload`, image, {
      headers: {
        'content-type': `application/octet-stream`,
        Authorization: `Bearer ${process.env.TOKEN}`,
        'Dropbox-API-Arg': JSON.stringify({
          path: `/Upload/${randomString}.jpg`,
          mode: 'overwrite',
          autorename: true,
          mute: false,
          strict_conflict: false,
        }),
      },
    })
    .then((resp) => {
      console.log(resp.data.path_display);
      return axios({
        method: 'POST',
        url: 'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings',
        headers: {
          Authorization: `Bearer ${process.env.TOKEN}`,
          'Content-Type': 'application/json',
        },
        data: {
          path: `${resp.data.path_display}`,
          settings: {
            access: 'viewer',
            allow_download: true,
            audience: 'public',
            requested_visibility: 'public',
          },
        },
      }).then((res) => {
        const urlCover = res.data.url.substring(0, res.data.url.length - 1) + 1;
        return urlCover;
      });
    })
    .catch((err) => {
      return err;
    });
  return response;
};

const fetchImages = async (bufferImgs) => {
  const imgsId = [];

  if (bufferImgs) {
    await Promise.all(
      bufferImgs.map(async (item) => {
        const randStr = crypto.randomBytes(5).toString('hex');
        const image = Buffer.from(item.uint8Array);
        await axios({
          method: 'POST',
          url: 'https://content.dropboxapi.com/2/files/upload',
          headers: {
            'content-type': `application/octet-stream`,
            Authorization: `Bearer ${process.env.TOKEN}`,
            'Dropbox-API-Arg': JSON.stringify({
              path: `/Upload/${randStr}.jpg`,
              mode: 'overwrite',
              autorename: true,
              mute: false,
              strict_conflict: false,
            }),
          },
          data: image,
        }).then((resp) => {
          console.log(imgsId);
          return axios({
            method: 'POST',
            url: 'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings',
            headers: {
              Authorization: `Bearer ${process.env.TOKEN}`,
              'Content-Type': 'application/json',
            },
            data: {
              path: `${resp.data.path_display}`,
              settings: {
                access: 'viewer',
                allow_download: true,
                audience: 'public',
                requested_visibility: 'public',
              },
            },
          }).then((res) =>
            imgsId.push({
              id: item.id,
              image: res.data.url.substring(0, res.data.url.length - 1) + 1,
            }),
          );
        });
      }),
    ).then(() => {
      console.log('imgsId from DropBox: ', imgsId);
      return imgsId;
    });
    return imgsId;
  }
};

module.exports = { fetchCoverImg, fetchImages };
