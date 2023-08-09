const path = require('path');

const faceapi = require("face-api.js")


// await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
// await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
// await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const fs = require("fs")


const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });


// const modelPath = path.join(__dirname, "public", "models")
// await faceapi.nets.faceRecognitionNet.loadFromUri(modelPath)
// await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath)
// await faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath)

// const modelPath = path.join(__dirname, "public", "models")



data = {
    name: "minhaaz",
    age: 21
}

let labeledFaceDescriptors;
let faceMatcher;


const loadLabeledImages = async () => {
    const label = "Minhaaz"
    const descriptions = []
    const picPath = path.join(__dirname, "public", "Minhaaz_pic.jpg")

    const img = await canvas.loadImage(picPath);
    // const img = await faceapi.fetchImage(picPath)
    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
    descriptions.push(detections.descriptor)
    return new faceapi.LabeledFaceDescriptors(label, descriptions)
}



const face_recognition = async () => {
    try {
        const modelPath = path.join(__dirname, "public", "models")
        // await faceapi.nets.faceRecognitionNet.loadFromUri(modelPath)
        // await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath)
        // await faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath)

        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);

        labeledFaceDescriptors = await loadLabeledImages()
        faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)


    } catch (err) {
        console.log(err)
    }
    // const net = new faceapi.SsdMobilenetv1()
    // await net.load('/models')
    // await faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    // await faceapi.loadSsdMobilenetv1Model("/models")
}

face_recognition()

module.exports = (app) => {
    app.get("/", (req, res) => {
        res.render("home", { data: data });
    });

    app.get("/home", (req, res) => {
        res.send('this is home page');
    })

    app.get('/about', (req, res) => {
        res.send("this is about page");
    })

    app.get("/profile/:id", (req, res) => {
        // res.send(`you requested id no ${req.params.id}`);
        data2 = {
            id: req.params.id,
        }
        res.render("home", { data: data2 });
    })

    // app.post("/check", (req, res) => {
    //     try {
    //         console.log(req.body)
    //         // res.json({
    //         //     message: 'Data received',
    //         //     data: req.body
    //         //   });

    //         // face_recognition();
    //         // res.send("done")
    //     } catch (err) {
    //         res.send(err)
    //     }
    // })

    // app.post('/check', upload.single('video'), async (req, res) => {
    //     console.log(req.file);
    //     const buffer = req.file.buffer;
    //     // console.log(buffer)

    //     // const img = new Image();
    //     // img.src = buffer;
    //     // const videoFrameCanvas = canvas.createCanvas(img.width, img.height);
    //     // // const ctx = videoFrameCanvas.getContext('2d');
    //     // // ctx.drawImage(img, 0, 0, img.width, img.height);

    //     // // Detect faces
    //     // const detections = await faceapi.detectAllFaces(videoFrameCanvas)
    //     //     .withFaceLandmarks()
    //     //     .withFaceDescriptors();

    //     // // Handle detections
    //     // console.log("detection:",detections);

    //     // const arrayBuffer = new Uint8Array(videoBufferData).buffer;

    //     const fileName=Math.random()

    //     fs.writeFile(`./pics/${fileName}.webm`, buffer, err => {
    //         if (err) {
    //           console.log(err);
    //         } else {
    //           console.log('pic saved');
    //         }
    //       });
    //     // // ...
    // });



    app.post("/check", async (req, res) => {
        const dataURL = req.body.image;
        // console.log(dataURL)
        const buffer = Buffer.from(dataURL.split(',')[1], 'base64');
        // console.log(buffer)

        // const fileName = Math.random()

        // fs.writeFile(`./pics/${fileName}.jpg`, buffer, err => {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         console.log('pic saved');
        //     }
        // });

        const img = await canvas.loadImage(buffer);
        // console.log("img :",img)
        // console.log("h, w", img.height, img.width)

        const displaySize = { width: img.width, height: img.height }

        const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        // console.log("resizedDetections...>>>", resizedDetections)
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
        console.log("results...>>>", results)


        res.json({
            message: 'Data received',
            data: results
        });

        // // ...
    });

    // app.post("/train", async(req, res) => {

    //     try{
    //         const dataURL = req.body.image;
    //         // console.log(dataURL)
    //         const buffer = Buffer.from(dataURL.split(',')[1], 'base64');

    //         const img = new Image();
    //         img.src = buffer;



    //         labeledFaceDescriptors=await loadLabeledImages(img)
    //         faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)

    //         res.json({
    //             message: 'Data received',
    //             data: "1"
    //         });
    //     } catch(err){
    //         res.json({
    //             message: err,
    //             data: "0"
    //         })
    //     }

    // })

}