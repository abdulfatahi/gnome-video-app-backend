import multer from 'multer';

// Get the file name and extension with multer
const storage = multer.diskStorage({
  filename: (_, file, cb) => {
    const fileExt = file.originalname.split('.').pop();
    const filename = `${new Date().getTime()}.${fileExt}`;
    cb(null, filename);
  },
});

// Filter the audio file to validate if it meets the required audio extension
const audioFileFilter = (_, file, cb) => {
  if (file.mimetype === 'audio/mp3' || file.mimetype === 'audio/mpeg') {
    cb(null, true);
  } else {
    cb(
      {
        message: 'Unsupported File Format',
      },
      false,
    );
  }
};

// Filter the vedio file to validate if it meets the required video extension
const videoFileFilter = (_, file, cb) => {
  if (file.mimetype === 'video/mp4') {
    cb(null, true);
  } else {
    cb(
      {
        message: 'Unsupported File Format',
      },
      false,
    );
  }
};

// Filter the image file to validate if it meets the required image extension
const imageFileFilter = (_, file, cb) => {
  if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/svg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(
      {
        message: 'Unsupported File Format',
      },
      false,
    );
  }
};

// Filter the image file to validate if it meets the required image extension
const gifFileFilter = (_, file, cb) => {
  if (file.mimetype === 'image/gif') {
    cb(null, true);
  } else {
    cb(
      {
        message: 'Unsupported File Format',
      },
      false,
    );
  }
};

// Set the storage, file filter and file size with multer for audio
const audioUpload = multer({
  storage,
  limits: {
    fieldNameSize: 200,
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: audioFileFilter,
});

// Set the storage, file filter and file size with multer for video
const videoUpload = multer({
  storage,
  limits: {
    fieldNameSize: 200,
    fileSize: 30 * 1024 * 1024,
  },
  fileFilter: videoFileFilter,
});

// Set the storage, file filter and file size with multer for image
const imageUpload = multer({
  storage,
  limits: {
    fieldNameSize: 200,
    fileSize: 30 * 1024 * 1024,
  },
  fileFilter: imageFileFilter,
});

// Set the storage, file filter and file size with multer for gif
const gifUpload = multer({
  storage,
  limits: {
    fieldNameSize: 200,
    fileSize: 30 * 1024 * 1024,
  },
  fileFilter: gifFileFilter,
});

export {
  audioUpload, videoUpload, imageUpload, gifUpload, multer,
};
