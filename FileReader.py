from flask import send_file
import os
import urllib.parse


class FileReader:
    CONTENT_DIR = "content"

    def read_file(self, path_to_file):
        path_to_file = urllib.parse.unquote(path_to_file)
        return send_file(os.path.join(self.CONTENT_DIR, path_to_file))
