from flask import request, Response, send_file
import mimetypes
import os
import re
import urllib.parse


class FileReader:
    CONTENT_DIR = "content"
    CHUNK_SIZE = 1024 * 1024

    VIDEO_MIME_TYPES = {
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".ogv": "video/ogg",
        ".ogg": "video/ogg",
    }

    as_download = False

    def _get_mimetype(self, path_to_file):
        extension = os.path.splitext(path_to_file)[1].lower()
        if extension in self.VIDEO_MIME_TYPES:
            return self.VIDEO_MIME_TYPES[extension]
        guessed, _ = mimetypes.guess_type(path_to_file)
        return guessed or "application/octet-stream"

    def _parse_range(self, range_header, file_size):
        match = re.match(r"bytes=(\d*)-(\d*)", range_header)
        if not match:
            return None

        start_str, end_str = match.groups()
        if start_str == "" and end_str == "":
            return None

        if start_str == "":
            # suffix range: last N bytes
            length = int(end_str)
            if length <= 0:
                return None
            start = max(0, file_size - length)
            end = file_size - 1
        else:
            start = int(start_str)
            end = int(end_str) if end_str else file_size - 1

        if start >= file_size or start > end:
            return None

        end = min(end, file_size - 1)
        return start, end

    def _stream_range(self, full_path, start, end, mimetype, download_name=None):
        length = end - start + 1
        file_size = os.path.getsize(full_path)

        def generate():
            with open(full_path, "rb") as f:
                f.seek(start)
                remaining = length
                while remaining > 0:
                    chunk = f.read(min(self.CHUNK_SIZE, remaining))
                    if not chunk:
                        break
                    remaining -= len(chunk)
                    yield chunk

        headers = {
            "Content-Type": mimetype,
            "Accept-Ranges": "bytes",
            "Content-Length": str(length),
            "Content-Range": "bytes {}-{}/{}".format(start, end, file_size),
        }
        if self.as_download and download_name:
            headers["Content-Disposition"] = 'attachment; filename="{}"'.format(download_name)

        return Response(generate(), status=206, headers=headers, direct_passthrough=True)

    def read_file(self, path_to_file):
        path_to_file = urllib.parse.unquote(path_to_file)
        full_path = os.path.join(self.CONTENT_DIR, path_to_file)
        mimetype = self._get_mimetype(path_to_file)
        file_size = os.path.getsize(full_path)
        download_name = os.path.basename(path_to_file)

        range_header = request.headers.get("Range")
        if range_header and not self.as_download:
            parsed = self._parse_range(range_header, file_size)
            if parsed is None:
                return Response(
                    status=416,
                    headers={
                        "Content-Range": "bytes */{}".format(file_size),
                        "Accept-Ranges": "bytes",
                    },
                )
            start, end = parsed
            return self._stream_range(full_path, start, end, mimetype, download_name)

        response = send_file(
            full_path,
            mimetype=mimetype,
            as_attachment=self.as_download,
            attachment_filename=download_name if self.as_download else None,
        )
        response.headers["Accept-Ranges"] = "bytes"
        return response
