from PIL import Image
import os
import subprocess
import urllib.parse
from flask import send_file


class ThumbnailGenerator:
    CONTENT_DIR = "content"
    THUMBNAIL_DIR = "thumbnails"
    MAX_SIZE = 140
    VIDEO_EXTENSIONS = {".mp4", ".webm", ".ogv", ".ogg"}

    def get_format(self, path):
        file_name, file_type = os.path.splitext(path)
        file_type = file_type[1:].lower()
        if file_type == "jpg":
            file_type = "jpeg"

        return file_type

    def _is_video(self, path):
        extension = os.path.splitext(path)[1].lower()
        return extension in self.VIDEO_EXTENSIONS

    def _is_cache_valid(self, source_path, cache_path):
        if not os.path.isfile(cache_path):
            return False
        return os.path.getmtime(source_path) <= os.path.getmtime(cache_path)

    def _generate_to_file(self, source_path, cache_path, format):
        image = Image.open(source_path)
        image = image.resize((self.MAX_SIZE, self.MAX_SIZE))

        os.makedirs(os.path.dirname(cache_path) or ".", exist_ok=True)
        image.save(cache_path, format, quality=70)

    def _generate_video_thumbnail(self, source_path, cache_path):
        os.makedirs(os.path.dirname(cache_path) or ".", exist_ok=True)
        temp_path = cache_path + ".tmp.jpg"

        def extract_frame(seek_time):
            return subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-ss", seek_time,
                    "-i", source_path,
                    "-frames:v", "1",
                    "-q:v", "2",
                    temp_path,
                ],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False,
            )

        result = extract_frame("1")
        if result.returncode != 0 or not os.path.isfile(temp_path):
            result = extract_frame("0")

        if result.returncode != 0 or not os.path.isfile(temp_path):
            if os.path.isfile(temp_path):
                os.remove(temp_path)
            raise RuntimeError("Failed to extract video thumbnail with ffmpeg")

        image = Image.open(temp_path)
        image = image.convert("RGB")
        image = image.resize((self.MAX_SIZE, self.MAX_SIZE))
        image.save(cache_path, "jpeg", quality=70)
        os.remove(temp_path)

    def make_thumbnail(self, path_to_file):
        path_to_file = urllib.parse.unquote(path_to_file)
        source_path = os.path.join(self.CONTENT_DIR, path_to_file)

        if self._is_video(path_to_file):
            cache_path = os.path.join(self.THUMBNAIL_DIR, path_to_file + ".jpg")
            mime_type = "image/jpeg"
            if not self._is_cache_valid(source_path, cache_path):
                self._generate_video_thumbnail(source_path, cache_path)
            return send_file(cache_path, mimetype=mime_type)

        cache_path = os.path.join(self.THUMBNAIL_DIR, path_to_file)
        file_type = self.get_format(path_to_file)
        mime_type = "image/" + file_type

        if not self._is_cache_valid(source_path, cache_path):
            self._generate_to_file(source_path, cache_path, file_type)

        return send_file(cache_path, mimetype=mime_type)
