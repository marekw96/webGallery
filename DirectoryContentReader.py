import os
from DirectoryEntry import DirectoryEntry
import urllib.parse
import json


class DirectoryContentReader:
    CONTENT_DIR = "content"

    def set_path(self, path):
        path = urllib.parse.unquote(path)
        self.CONTENT_DIR += "/" + path

    def read(self):
        files = []
        for file in os.listdir(self.CONTENT_DIR):
            if file == ".keep":
                continue

            file_path = os.path.join(self.CONTENT_DIR, file)

            entry = DirectoryEntry()
            entry.id = len(files)
            entry.name = file

            if os.path.isfile(file_path):
                extension = os.path.splitext(file_path)[1].lower()
                if extension in ['.jpeg', '.jpg', '.gif', '.png']:
                    entry.type = DirectoryEntry.Type.image
                else:
                    entry.type = DirectoryEntry.Type.file
            elif os.path.isdir(file_path):
                entry.type = DirectoryEntry.Type.directory
            else:
                entry.type = DirectoryEntry.Type.other

            files.append(entry)

        return files

    def read_as_json(self):
        entries = self.read()
        return json.dumps(entries, cls=DirectoryEntry)
