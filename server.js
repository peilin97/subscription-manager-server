import express, { request } from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import { graphqlHTTP } from 'express-graphql';
import dotenv from 'dotenv';
import userSchema from './src/graphql/userIndex.js';
import adminSchema from './src/graphql/adminIndex.js';
import { getUserId } from './src/utils.js';

dotenv.config();
// connect mongoose to the mongodb database
const mongoDBEndpoint = process.env.MONGODB_URI || 'mongodb://127.0.0.1/sub_manager';
mongoose.connect(mongoDBEndpoint, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    })
    .then(() => console.log('DB Connected'))
    .catch(err => console.log('DB Connection Error: '+ err.message));
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error connecting to mongodb'));

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
const corsCredentials = {
    credentials: true,
    // origin: process.env.PLAYGROUND_URL,
    origin: true,
}
app.use(cors(corsCredentials));
app.options('*', cors(corsCredentials));
app.use(express.urlencoded({
    extended: true
}));

app.set('port', (process.env.PORT || 5000))

function context(req) {
    // console.log("req: "+ req);
    return req && req.headers.authorization
          ? getUserId(req)
          : null;
}

// user's endpoint
app.use('/user', graphqlHTTP((request, response) => ({
    //directing express-graphql to use this schema to map out the graph 
    schema: userSchema,
    context: {
        request: request,
        response: response,
        userId: context(request),
    },
    graphiql:true
})));

// administrator's endpoint
app.use('/admin', graphqlHTTP((request, response) => ({
    schema: adminSchema,
    context: {
        request: request,
        response: response,
        adminId: context(request),
    },
    graphiql:true
})));

// for testing
app.use('/', function (req, res) {
    // console.log(req.ip);
    res.send("hello");
})

app.listen(app.get('port'), () => {
    console.log("App is running at localhost:" + app.get('port'));
}); 
