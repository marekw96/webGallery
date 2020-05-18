from flask import Flask, render_template, send_file
from DirectoryContentReader import DirectoryContentReader
from ThumbnailGenerator import ThumbnailGenerator
from FileReader import FileReader

Config = {"resource": "static/"}


class CustomFlask(Flask):
    jinja_options = Flask.jinja_options.copy()
    jinja_options.update(dict(
        variable_start_string='%{{',  # Default is '{{', I'm changing this because Vue.js uses '{{' / '}}'
        variable_end_string='}}%',
    ))


app = CustomFlask(__name__, template_folder="static/")


@app.route("/getThumbnail/<path:path_to_file>")
def get_thumbnail(path_to_file):
    thumbnail_generator = ThumbnailGenerator()
    return send_file(thumbnail_generator.make_to_io(path_to_file), mimetype="image/jpeg")


@app.route("/getFile/<path:path_to_file>")
def get_file(path_to_file):
    file_reader = FileReader()
    return file_reader.read_file(path_to_file)


@app.route("/getDirContent")
@app.route("/getDirContent/")
@app.route("/getDirContent/<path:content_path>")
def get_dir_content(content_path="/"):
    reader = DirectoryContentReader()
    reader.set_path(content_path)
    return reader.read_as_json()


@app.route('/', defaults={'path_to_dir': ''})
@app.route('/<path:path_to_dir>')
def start(path_to_dir):
    return render_template('index.html', Config=Config)


if __name__ == '__main__':
    app.run(host='0.0.0.0')
