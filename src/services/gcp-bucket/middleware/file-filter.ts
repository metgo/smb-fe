import { UnsupportedMediaTypeException } from '@nestjs/common';

export const fileFilterByExtensions = (req, file, callback) => {
  const fileType = file.mimetype.split('/')[1];

  if (!fileType.match(/^(jpg|jpeg|png)$/)) {
    return callback(
      new UnsupportedMediaTypeException("Doesn't support this format"),
      false,
    );
  }

  return callback(null, true);
};
