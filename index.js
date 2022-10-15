const express = require('express');
const axios = require('axios');
const logger = require('morgan');
const path = require('node:path');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({ dest: './uploads/' });
const fs = require('fs');
const { performance } = require('node:perf_hooks');
const { spawn } = require('node:child_process');
const { Buffer } = require('node:buffer');
const { measurePerformance } = require('./utils');
const app = express();
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const { worker, isMainThread, parentPort, workerData } = require('node:worker_threads');
//const api = require('./api');
//var router = express.Router();
const port = 3000;

app.use(logger('tiny'));
app.use(bodyParser.urlencoded({ extended: false }));
//app.use("/api", api);

//Read & Write file
function csv2pdf() {
	fs.open("./uploads/data.csv", 'r+', (err,fd) => {
		if(!err){
			//console.log(fd);
			fs.readFile(fd, (err, buffer) => {
				//console.log(buffer.toString());
				//res.end(buffer);//console.log(buffer.subarray(0,10).toString());
				//const buf2 = Buffer.concat([buffer,buffer]);
				//doc.pipe(buffer);
				//doc.end();
				fs.open("./uploads/myFile.txt", 'w+', (err, fd1) => {
					fs.writeFile(fd1, buffer, (err, bytesWritten, buffer) => {
						var options = {
							root: path.join(__dirname + '/uploads')
						}
						/*res.download("myFile.pdf", options, (err) => {
							console.log(err);
						});*/
					});
				});
			});
		}
	});
}

function csv2pdf2(req,res) {
	const doc = new PDFDocument({size: 'A4'});
	doc.pipe(fs.createWriteStream('./uploads/output.pdf'));

	var myReadStream = fs.createReadStream("./uploads/data.csv");
	myReadStream.on("data", function(data){
		doc.text(data);
	});

	myReadStream.on("end", () => {
		doc.end();
	});

	res.send('CSV to PDF Convertor');
}

function sendMail(req,res){
	nodemailer.createTestAccount().then((testAccount) => {
		let transporter = nodemailer.createTransport({
			host: "smtp.mailgun.org",
			port: 587,
			secure: false,
			auth: {
				user: "postmaster@sandbox0f287e98b6a842819e44ee1c1db51481.mailgun.org",
				pass: "66d0dfee52e0a11eb8b5888a896c7b83-4534758e-1664cbc1"
			}
		});

		transporter.sendMail({
			from: 'abhijeetgoel77@gmail.com',
			to: 'abhijeetgoel77@gmail.com',
			subject: 'Hello',
			text: "Hello World",
			html: "<b>Hello World</b>",
			attachments: [
				{
					filename: 'output.pdf',
					path: path.join(__dirname, "./uploads/output.pdf"),
					contentType: 'application/pdf'
				}
			]
		}, (error, cb) => {
			console.log(cb.messageId);
		});
	})
	res.send('mail !!');
}

function sendOTP(req, res) {
	const authKey = "303034AxCR0x5DGYK5dc6d39d";
	const mobile = 917456883325;
	const template_id = "5dc94d76d6fc0578bc42c4e7";
	axios.get(`http://api.msg91.com/api/v5/otp?template_id=${template_id}&mobile=${mobile}&authkey=${authKey}`)
		.then((response) => res.send(response.data))
		.catch((error) => res.send(error));
}

function readFile(req, res) {
		fs.readFile('uploads/myFile.png', (err, data) => {
			if(err) throw err;
			console.log(data);
		});
		res.send('reading file');
}

function convertor(req, res) {
	const ls = spawn('conda', ['init'], {
		detached: true
	});
	//, 'activate', 'text'
	//, ['-lh', '/home/abhi/projects/testaing/']
	ls.stdout.on('data', (data) => {
		console.log(`stdout ${data}`);
	});

	ls.stderr.on('data', (data) => {
		console.error(`error ${data}`);
	});

	ls.on('close', (code) => {
	  console.log(`child process exited with code ${code}`);
	});

	res.send('convert');
}

app.get('/mail', sendMail);
app.get("/csv2pdf", csv2pdf2);
app.get('/sendOTP', sendOTP);
app.get('/readFile', readFile);

app.get('/', (req, res) => {
	//measurePerformance();
	res.send('I am just an API.');
});

app.post('/', upload.single('profile'), (req,res) => {
	//const body = req.body;
	//const name = req.body.name;
	//const age = req.body.age;
	const file = req.file;
	res.send("Hello");
});

app.get("/getFile", (req,res) => {
	res.download('uploads/myFile.png');
});

app.get('/myserver', (req,res) => {
	const URL = "https://api.bahikhata.org/parse";
	const appId = "bahiAppId";
	const apiKey = "myrestApiKey"
	const objectId = "Fmk0EqBiFh";
	//,'X-Parse-REST-API-Key': apiKey
	axios.get(`${URL}/classes/Account/${objectId}`, {
		headers : {
			'X-Parse-Application-Id': appId
		}
	}).then((response) => console.log(resonse.data))
		.catch((error) => console.log(error));
});

app.get('/test', (req,res) => {
	axios.get("https://reqres.in/api/users")
	.then((response) => res.send(response.data))
	.catch((error) => console.log(error));
});

app.post('/test', (req,res) => {
	axios.post("https://reqres.in/api/users", {name: "Abhijeet", job: 'engineer'})
	.then((response) => res.send(response.data))
	.catch((error) => console.log(error));
});

// Generate pdf report & send to email
app.get("/report", (req,res) => {
	res.send("Sending Report right away");
});

// Run command line tool to convert image from jpg to webp and show progress.
app.get('/convertor', convertor);

//Connecting to a remote api endpoint behind a authorization


//Connect to a database.


//Check credit algorithm


app.listen(port, () => {
	console.log(`server listening on port ${port}`);
});
