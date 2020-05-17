from PIL import Image
import os
from io import BytesIO


class ThumbnailGenerator:
    CONTENT_DIR = "content"
    MAX_SIZE = 256

    def make_to_io(self, path_to_file):
        image = Image.open(os.path.join(self.CONTENT_DIR, path_to_file))
        image.thumbnail((self.MAX_SIZE, self.MAX_SIZE))

        img_io = BytesIO()
        image.save(img_io, 'JPEG', quality=70)
        img_io.seek(0)

        return img_io

