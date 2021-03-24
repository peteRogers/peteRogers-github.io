let faceapi;
let video;
let detections;
let lastR = null;
let wait = 0;

// by default all options are set to true
const detection_options = {
    withLandmarks: true,
    withDescriptors: false,
}


function setup() {
    createCanvas(720, 576);

    // load up your video
    video = createCapture(VIDEO);
    video.size(width, height);
    //video.hide(); // Hide the video element, and just show the canvas
    faceapi = ml5.faceApi(video, detection_options, modelReady)
    textAlign(CENTER, CENTER);
    var firebaseConfig = {
        apiKey: "AIzaSyBz95TVGC1Xe23iOEYMlQ5JHA8lQx3gu_U",
        authDomain: "scarf-9e912.firebaseapp.com",
        databaseURL: "https://scarf-9e912-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "scarf-9e912",
        storageBucket: "scarf-9e912.appspot.com",
        messagingSenderId: "180600468387",
        appId: "1:180600468387:web:e6fce76c4e0e2c7812e016",
        measurementId: "G-D1D1110Z2B"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();

}

function modelReady() {
    //  console.log('ready!')
    // console.log(faceapi)
    faceapi.detect(gotResults)

}

function gotResults(err, result) {
    if (err) {
        console.log(err)
        return
    }
    // console.log(result)
    detections = result;

    // background(220);
    background(0);
    // image(video, 0,0, width, height)
    if (detections) {
        if (detections.length > 0) {
            // console.log(detections)
            drawBox(detections)
            drawLandmarks(detections)
        }
    }
    faceapi.detect(gotResults)
}

function sendToFirebase() {
    var flicks = database.ref('ticks');

    // Make an object with data in it
    var t = ""+day()+"/"+month()+" "+hour()+":"+minute()+":"+second()
    var data = {
        myTime: t
    }

    var fruit = flicks.push(data, finished);
    console.log("Firebase generated key: " + fruit.key);

    // Reload the data for the page
    function finished(err) {
        if (err) {
            console.log("ooops, something went wrong.");
            console.log(err);
        } else {
            console.log('Data saved successfully');
        }
    }
}

function drawBox(detections) {
    for (let i = 0; i < detections.length; i++) {
        const alignedRect = detections[i].alignedRect;
        const x = alignedRect._box._x
        const y = alignedRect._box._y
        const boxWidth = alignedRect._box._width
        const boxHeight = alignedRect._box._height

        noFill();
        stroke(161, 95, 251);
        strokeWeight(2);
        // rect(x, y, boxWidth, boxHeight);
    }

}

function drawLandmarks(detections) {
    noFill();
    stroke(161, 95, 251)
    strokeWeight(2)

    for (let i = 0; i < detections.length; i++) {
        const mouth = detections[i].parts.mouth;
        const nose = detections[i].parts.nose;
        const leftEye = detections[i].parts.leftEye;
        const rightEye = detections[i].parts.rightEye;
        const rightEyeBrow = detections[i].parts.rightEyeBrow;
        const leftEyeBrow = detections[i].parts.leftEyeBrow;

        //drawPart(mouth, true);
        ellipse(mouth[3].x, mouth[3].y, 10, 10);
        ellipse(leftEye[3].x, leftEye[3].y, 10, 10);
        ellipse(rightEye[0].x, rightEye[0].y, 10, 10);

        //drawPart(nose, false);
        //  drawPart(leftEye, true);
        // drawPart(leftEyeBrow, false);
        //drawPart(rightEye, true);
        // drawPart(rightEyeBrow, false);
        line(leftEye[3].x, leftEye[3].y, rightEye[0].x, rightEye[0].y);
        //let v1 = createVector(leftEye[3].x, leftEye[3].y);
        //let v2 = createVector(rightEye[0].x, rightEye[0].y);
        //let angle = v2.angleBetween(v1);
        // console.log(degrees(angle))
        push();

        strokeWeight(3);

        translate(width / 2, height / 2);
        var r = radians(myangle(leftEye[3].x, leftEye[3].y, rightEye[0].x, rightEye[0].y))
        rotate(r);
        //rotate(angle);
        if (lastR) {

            let diff = lastR - r;
            if (abs(diff) > 0.15 && wait == 0) {
                console.log('strong');
                sendToFirebase()
                wait = 10;
            } else if (wait > 0) {
                console.log('waiting');
                wait--;
            }
            lastR = r;
        } else {
            lastR = r;
        }
        line(-width / 2, 0, width / 2, 0);

        pop()
        //console.log(myangle(leftEye[3].x, leftEye[3].y,rightEye[0].x, rightEye[0].y));
    }

}

function myangle(cx, cy, ex, ey) {
    var dy = ey - cy;
    var dx = ex - cx;
    var theta = atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / PI; // rads to degs, range (-180, 180]
    //if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
}

function drawPart(feature, closed) {
    ellipse(feature[0].x, feature[0].y, 5, 5);

    beginShape();
    for (let i = 0; i < feature.length; i++) {
        const x = feature[i]._x
        const y = feature[i]._y
        vertex(x, y)
        text(i, x, y);
    }

    if (closed === true) {
        endShape(CLOSE);
    } else {
        endShape();
    }

}