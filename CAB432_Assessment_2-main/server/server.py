import os
import requests
import json
import cv2
import cvlib as cv
from cvlib.object_detection import draw_bbox
import numpy as np
from urllib.request import Request, urlopen
from flask import Flask, request
import redis
import boto3
from datetime import datetime
import base64


app = Flask(__name__, static_folder='../client/build', static_url_path='/')

url = "https://api.qldtraffic.qld.gov.au/v1/webcams?apikey=" + str(os.environ.get("API_KEY"))

# redis connection
r = redis.Redis(host=os.environ.get("REDIS_ENDPOINT"),port=os.environ.get("REDIS_PORT"), db=0)
# s3 connection
s3_client = boto3.client('s3', region_name=str(os.environ.get("AWS_REGION")))
s3_bucket = str(os.environ.get("BUCKET_NAME"))

# Serve React App
@app.route('/')
def index():
    return app.send_static_file('index.html')

# Routes
@app.route('/locations')
def get_traffic_locations():
    res = requests.get(url)
    my_json = json.loads(res.text)

    arr = [x['properties']['description'] for x in my_json["features"]]
    
    return { "locations": arr }


@app.route('/traffic')
def get_traffic_cam():
    arg = request.args
    if not arg["idx"]:
        return "Record not found", 400

    #get the name of the street they want
    res = requests.get(url)
    my_json = json.loads(res.text)

    cameraidx = int(arg["idx"])
    camera_name = my_json["features"][cameraidx]["properties"]["description"]
    

    if r.get(camera_name) == None:
        #get the timestamp rounded down, query s3 etc
        now = datetime.now()
        dt_string = now.strftime("%Y-%m-%d_%H-%M")
        s3_upload_name = camera_name + '/' + dt_string + '.jpg'
        try:
            # check s3 for the specified key
            response = s3_client.get_object(Bucket=s3_bucket, Key=s3_upload_name)

            base64_image = response['Body'].read()
            label = response['Metadata']['labels']
        except Exception as e:
            # do the proccessing
            img = url_to_image(my_json["features"][cameraidx]["properties"]["image_url"])
            bbox, label, conf = cv.detect_common_objects(img)
            output_image = draw_bbox(img, bbox, label, conf)
            _, encoded_image = cv2.imencode('.jpg', output_image)
            bytes_image = encoded_image.tobytes()
            base64_image = base64.b64encode(bytes_image)
            # put in S3
            s3_client.put_object(Bucket=s3_bucket, Key=s3_upload_name, Body=base64_image, Metadata={
                'labels': str(label)
            })
        # put it in redis
        r.set(camera_name, base64_image, ex=10)
        r.set(camera_name + 'labels', str(label), ex=10)
    else:
        base64_image = r.get(camera_name)
        label = r.get(camera_name + 'labels')
        label1 = label.decode("utf-8")
        label = [x.strip("'[]") for x in label1.split(', ')]

    now = datetime.now()
    dt_string = now.strftime("%Y-%m-%d_%H-%M")
    arr = dt_string.split("_")
    #send response
    return { "cars": label, "image": str(base64_image), "date": arr[0], "time": arr[1] }


@app.route('/history')
def get_traffic_history():
    arg = request.args
    if not arg["idx"]:
        return "Record not found", 400

    res = requests.get(url)
    my_json = json.loads(res.text)

    cameraidx = int(arg["idx"])
    camera_name = my_json["features"][cameraidx]["properties"]["description"]

    response = s3_client.list_objects_v2(Bucket=s3_bucket, Prefix=camera_name + '/')
    contents = response['Contents']

    images = []
    labels = []
    dates = []
    times = []

    for i in contents:
        key = i["Key"]
        response = s3_client.get_object(Bucket=s3_bucket, Key=key)
        images.append(str(response['Body'].read()))
        label = response['Metadata']['labels']
        labels.append([x.strip("'[]") for x in label.split(', ')])
        name = key.split("/")[1].split("_")
        dates.append(name[0])
        times.append(name[1].split(".")[0])

    #send response
    return { "images": images, "labels": labels, "dates": dates, "times": times }


# Helper Functions
def url_to_image(url):
    req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = urlopen(req).read()
    image = np.asarray(bytearray(res), dtype="uint8")
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    
    return image