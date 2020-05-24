from flask import Flask, render_template, send_file, request
from DirectoryContentReader import DirectoryContentReader
from ThumbnailGenerator import ThumbnailGenerator
from FileReader import FileReader
from ZipGenerator import ZipGenerator

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
    return thumbnail_generator.make_thumbnail(path_to_file)


@app.route("/getFile/<path:path_to_file>")
def get_file(path_to_file):
    file_reader = FileReader()

    if request.args.get('download'):
        file_reader.as_download = True

    return file_reader.read_file(path_to_file)


@app.route("/getDirContent")
@app.route("/getDirContent/")
@app.route("/getDirContent/<path:content_path>")
def get_dir_content(content_path="/"):
    reader = DirectoryContentReader()
    reader.set_path(content_path)

    if request.args.get('flat'):
        reader.set_flat_read(True)

    return reader.read_as_json()


@app.route("/zipDir")
@app.route("/zipDir/")
@app.route("/zipDir/<path:content_path>")
def zip_dir(content_path="/"):
    zip_gen = ZipGenerator()
    zip_gen.set_path(content_path)

    if request.args.get('flat'):
        zip_gen.set_flat_read(True)

    return zip_gen.return_zip()


@app.route('/', defaults={'path_to_dir': ''})
@app.route('/<path:path_to_dir>')
def start(path_to_dir):
    return render_template('index.html', Config=Config)


if __name__ == '__main__':
    app.run(host='0.0.0.0')
