from PIL import Image
import os
from io import BytesIO
import urllib.parse
from flask import send_file


class ThumbnailGenerator:
    CONTENT_DIR = "content"
    MAX_SIZE = 256

    def make_to_io(self, path_to_file, format):
        image = Image.open(os.path.join(self.CONTENT_DIR, path_to_file))
        image = image.resize((self.MAX_SIZE, self.MAX_SIZE), Image.ANTIALIAS)

        img_io = BytesIO()
        image.save(img_io, format, quality=70)
        img_io.seek(0)

        return img_io

    def get_format(self, path):
        file_name, file_type = os.path.splitext(path)
        file_type = file_type[1:].lower()
        if file_type == "jpg":
            file_type = "jpeg"

        return file_type

    def make_thumbnail(self, path_to_file):
        path_to_file = urllib.parse.unquote(path_to_file)
        file_type = self.get_format(path_to_file)
        stream = self.make_to_io(path_to_file, file_type)
        mime_type = "image/" + file_type

        return send_file(stream, mimetype=mime_type)
