from flask import send_file
import os


class FileReader:
    CONTENT_DIR = "content"

    def read_file(self, path_to_file):
        return send_file(os.path.join(self.CONTENT_DIR, path_to_file))
