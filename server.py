"""
server.py
Code to run python-flask server to host html files.
"""

# importing required modules
import sys
import json
import random
import os
from flask import render_template, Flask, request, session
from PIL import Image
import base64

app = Flask(__name__)
app.secret_key = 'vitl lab'

# method to process captured images to
#be used as environment maps
def process_image(filepath):
    im = Image.open(filepath)
    im_re = im.resize((2048, 2048))
    im_ro = im_re.rotate(angle=-90)
    im_ro.save(filepath)

# method to show initial environment mapping
@app.route('/test_mirror')
def mirror():
    form_fields = {'text': activity_map['calibrate'],
                   'uv_map': '',
                   'next_page':'',
                   'post_url':''}
    return render_template('dent_tis_mirror.html', form_fields=form_fields)

# main method that shows room demo
@app.route('/')
def project():
    form_fields = {'next_page': '/end',
                   'post_url': '/project'}
    return render_template('dent_mouse.html', form_fields=form_fields)

# video texture example
@app.route('/custom')
def custom():
    return render_template('video_reflection_demo.html')

# method to save image from device to do processing
# not used currently
@app.route('/project_post', methods = {'POST'})
def post_project_data():
    img64 = request.json['img']
    img = base64.b64decode(img64)
    filename = 'test.jpg'
    with open(filename, 'wb') as f:
        f.write(img)
    return "ok"

# permission page for device orientation
# not used currently
@app.route('/permission')
def permission_page():
    session['counter'] = 1
    return render_template('permission.html', next_page="/custom")

if __name__ == '__main__':
    app.run(host='0.0.0.0', ssl_context='adhoc')
    #app.run(host='192.168.43.242', ssl_context='adhoc')
    #files = ['nx', 'px', 'ny', 'py', 'nz', 'pz']
    #for names in files:
    #    filepath = './static/lab/' + names + '.jpg'
    #    process_image(filepath)
