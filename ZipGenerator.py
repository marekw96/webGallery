from DirectoryContentReader import DirectoryContentReader
import io
import zipfile
import urllib.parse
import time
import os
from flask import send_file


class ZipGenerator:
    def __init__(self):
        self.CONTENT_DIR = "content"
        self.dir_reader = DirectoryContentReader()

    def set_path(self, url):
        self.dir_reader.set_path(url)
        self.CONTENT_DIR += "/" + urllib.parse.unquote(url)

    def set_flat_read(self, is_flat):
        self.dir_reader.set_flat_read(is_flat)


    def make_zip(self):
        entries = self.dir_reader.read_entries()
        memory_zip = io.BytesIO()

        with zipfile.ZipFile(memory_zip, 'w') as zip_file:
            for file in entries:
                if file.type == file.Type.directory:
                    continue

                data = zipfile.ZipInfo(file.name.replace("./", ""))
                data.date_time = time.localtime(time.time())[:6]
                data.compress_type = zipfile.ZIP_DEFLATED
                path_to_file = self.CONTENT_DIR + "/" + file.name
                with open(path_to_file, mode='rb') as f:
                    zip_file.writestr(data, f.read())

        memory_zip.seek(0)
        return memory_zip

    def get_name_from_path(self):
        name = self.CONTENT_DIR.split("/")[-1]

        if len(name) == 0:
            name = "start_dir"

        return name + ".zip"

    def return_zip(self):
        return send_file(self.make_zip(), attachment_filename=self.get_name_from_path(), as_attachment=True)