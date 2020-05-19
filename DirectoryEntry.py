import json


class DirectoryEntry(json.JSONEncoder):
    class Type:
        other = 0
        file = 1
        image = 2
        directory = 3  # must be last to make sorting be correct

    id = -1
    name = "No name"
    type = Type.other

    def _type_to_string(self):
        if self.type == self.Type.other:
            return "other"
        if self.type == self.Type.file:
            return "file"
        if self.type == self.Type.directory:
            return "directory"
        if self.type == self.Type.image:
            return "image"
        raise Exception("NOT FOUND")

    def default(self, obj):
        if isinstance(obj, DirectoryEntry):
            return {"id": obj.id, "name": obj.name, "type": obj._type_to_string()}
        else:
            return json.JSONEncoder.default(self, obj)