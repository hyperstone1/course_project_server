const axios = require('axios');
const crypto = require('crypto');
const Review = require('../../model/review');
const Tags = require('../../model/tags');
const { dbx } = require('../../dropbox/dropbox');

const fetchCoverImg = async (image) => {
  const randomString = crypto.randomBytes(5).toString('hex');
  const response = await dbx
    .filesUpload({ path: `/Upload/${randomString}.jpg`, contents: image })
    .then((resp) => {
      console.log('resp: ', resp);
      console.log('resp.result.path_display: ', resp.result.path_display);
      return dbx
        .sharingCreateSharedLinkWithSettings({ path: `${resp.result.path_display}` })
        .then((res) => {
          console.log('res.result.url: ', res.result.url);
          const urlCover = res.result.url.substring(0, res.result.url.length - 1) + 1;
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
        await dbx.filesUpload({ path: `/Upload/${randStr}.jpg`, contents: image }).then((resp) => {
          console.log('resp: ', resp);
          console.log('resp.result.path_display: ', resp.result.path_display);
          return dbx
            .sharingCreateSharedLinkWithSettings({
              path: `${resp.result.path_display}`,
            })
            .then((res) =>
              imgsId.push({
                id: item.id,
                image: res.result.url.substring(0, res.result.url.length - 1) + 1,
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
