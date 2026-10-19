from PIL import Image
import os
import urllib.parse
from flask import send_file


class ThumbnailGenerator:
    CONTENT_DIR = "content"
    THUMBNAIL_DIR = "thumbnails"
    MAX_SIZE = 140

    def get_format(self, path):
        file_name, file_type = os.path.splitext(path)
        file_type = file_type[1:].lower()
        if file_type == "jpg":
            file_type = "jpeg"

        return file_type

    def _is_cache_valid(self, source_path, cache_path):
        if not os.path.isfile(cache_path):
            return False
        return os.path.getmtime(source_path) <= os.path.getmtime(cache_path)

    def _generate_to_file(self, source_path, cache_path, format):
        image = Image.open(source_path)
        image = image.resize((self.MAX_SIZE, self.MAX_SIZE))

        os.makedirs(os.path.dirname(cache_path) or ".", exist_ok=True)
        image.save(cache_path, format, quality=70)

    def make_thumbnail(self, path_to_file):
        path_to_file = urllib.parse.unquote(path_to_file)
        source_path = os.path.join(self.CONTENT_DIR, path_to_file)
        cache_path = os.path.join(self.THUMBNAIL_DIR, path_to_file)
        file_type = self.get_format(path_to_file)
        mime_type = "image/" + file_type

        if not self._is_cache_valid(source_path, cache_path):
            self._generate_to_file(source_path, cache_path, file_type)

        return send_file(cache_path, mimetype=mime_type)
