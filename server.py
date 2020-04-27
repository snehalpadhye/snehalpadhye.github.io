import sys
import json
import random
import os
from flask import render_template, Flask, current_app, request, session
from datetime import datetime
from PIL import Image
import base64

app = Flask(__name__)
app.secret_key = 'vitl lab'

num_of_activity = 6
activity_map = { 'name':'dent_tis.html',
                 'calibrate':"We need to capture some images in order to calibrate. Turn to your left and press capture image",
                 '2':"Come back to your original position. Now Turn to your right and press capture image",
                 '3':"Come back to your original position. Press capture image to capture front",
                 '4':"Come back to your original position. Now Turn to your back and press capture image",
                 '5':"Come back to your original position. Now capture an image of top area",
                 '6':"Now capture an image of bottom area",

}
image_map = { 1: "nx.jpg",
                  2:"px.jpg",
                  3:"pz.jpg",
                  4:"nz.jpg",
                  5:"py.jpg",
                  6:"ny.jpg"
}


def set_activity_list():
    return range(1, num_of_activity+1)

def process_image(filepath):
    im = Image.open(filepath)
    im_re = im.resize((2048, 2048))
    im_ro = im_re.rotate(angle=-90)
    im_ro.save(filepath)

@app.route('/env')
def env():
    session['counter'] = 1
    return render_template('env_test.html')
    #return render_template('project.html', next_page="/project")

@app.route('/test')
def main():
    form_fields = {'text': activity_map['calibrate'],
                   'uv_map': '',
                   'next_page':'',
                   'post_url':''}
    return render_template('dent_tis.html', form_fields=form_fields)

@app.route('/test_mirror')
def mirror():
    form_fields = {'text': activity_map['calibrate'],
                   'uv_map': '',
                   'next_page':'',
                   'post_url':''}
    return render_template('dent_tis_mirror.html', form_fields=form_fields)
@app.route('/')
def project():
    form_fields = {'next_page': '/end',
                   'post_url': '/project'}
    return render_template('project.html', form_fields=form_fields)

@app.route('/project_post', methods = {'POST'})
def post_project_data():
    img64 = request.json['img']
    img = base64.b64decode(img64)
    filename = 'test.jpg'
    with open(filename, 'wb') as f:
        f.write(img)
    return "ok"

@app.route('/permission')
def permission_page():
    session['counter'] = 1
    return render_template('permission.html', next_page="/test")
    #return render_template('project.html', next_page="/project")

@app.route('/calibrate')
def calibrate():
    if session['counter'] == 1:
        session['folder'] = './data/'
        print(session['folder'])
        session['activity_list'] = set_activity_list()
    heading = "Calibration Part " + str(session['counter'])
    form_fields = {"heading" : heading,
                   "text" : activity_map[session['counter']],
                   "post_url" : "/calibrate"}
    if session['counter'] == 1:
        form_fields['text'] = activity_map['calibrate']
    if session['counter'] > num_of_activity:
        form_fields["next_page"] = "/activity"

    return render_template('calibration.html', next_page="calibrate", form_fields=form_fields)

@app.route('/activity')
def activity():
    form_fields = {"next_page" : "/end"}
    session['counter'] += 1
    if session['counter'] > num_of_activity:
        form_fields["next_page"] = "end"
    return render_template('tis.html', form_fields=form_fields)


@app.route('/calibrate', methods = {'POST'})
def post_calibrate_data():

    post_data = request.form['post_values']
    extracted_data = json.loads(post_data)
    values = extracted_data['alpha_beta_gamma']
    param = extracted_data['params']
    dent_pos = extracted_data['dent_position_response']
    try:
        json_data = {'uv':param, 'touches':dent_pos, 'orientation':values}
        with open(file_string, 'w+') as f:
            json.dump(json_data, f)

        with open(file_txt, 'w+') as fs:
                print(param, file=fs)
                print(dent_pos, file=fs)
                print(values, file=fs)
    except Exception as e:
        print(e)
    return 'done'

@app.route('/end')
def end():
    form_fields = {"heading" : "Visual Imaging And Technology Lab", "text" : "Thanks for your participation!" }
    #option_chosen = request.args['option']
    #print("Option Chosen = ", option_chosen)
    return render_template('end_page.html', form_fields=form_fields)

if __name__ == '__main__':
    app.run(host='0.0.0.0', ssl_context='adhoc')
    #files = ['nx', 'px', 'ny', 'py', 'nz', 'pz']
    #for names in files:
    #    filepath = './static/lab/' + names + '.jpg'
    #    process_image(filepath)
