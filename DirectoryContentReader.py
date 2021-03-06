import os
from DirectoryEntry import DirectoryEntry
import urllib.parse
import json
import operator


class DirectoryContentReader:
    def __init__(self):
        self.CONTENT_DIR = "content"
        self.read_as_flat = False

    def set_path(self, path):
        path = urllib.parse.unquote(path)
        self.CONTENT_DIR += "/" + path

    def set_flat_read(self, is_flat):
        self.read_as_flat = is_flat

    def get_type(self, file_path):
        if os.path.isfile(file_path):
            extension = os.path.splitext(file_path)[1].lower()
            if extension in ['.jpeg', '.jpg', '.gif', '.png']:
                return DirectoryEntry.Type.image
            else:
                return DirectoryEntry.Type.file
        elif os.path.isdir(file_path):
            return DirectoryEntry.Type.directory
        else:
            return DirectoryEntry.Type.other

    def read(self):
        files = []
        for file in os.listdir(self.CONTENT_DIR):
            if file == ".keep":
                continue

            file_path = os.path.join(self.CONTENT_DIR, file)

            entry = DirectoryEntry()
            entry.id = len(files)
            entry.name = file
            entry.type = self.get_type(file_path)

            files.append(entry)

        files.sort(key=lambda item: (item.type != DirectoryEntry.Type.directory, item.name))

        return files

    def read_flat(self):
        files_out = []

        for path, subdirs, files in os.walk(self.CONTENT_DIR):
            dir_path = path[len(self.CONTENT_DIR):]
            if len(dir_path) == 0:
                dir_path = "."

            for file in files:
                if file == ".keep":
                    continue

                file_path = os.path.join(path, str(file))

                entry = DirectoryEntry()
                entry.id = len(files)
                entry.name = os.path.join(dir_path, str(file))
                entry.type = self.get_type(file_path)

                files_out.append(entry)

        files_out.sort(key=lambda item: item.name)

        return files_out

    def read_entries(self):
        if self.read_as_flat:
            return self.read_flat()
        else:
            return self.read()

    def read_as_json(self):
        return json.dumps(self.read_entries(), cls=DirectoryEntry)
