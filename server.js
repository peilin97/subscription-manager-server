import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import { graphqlHTTP } from 'express-graphql';
import dotenv from 'dotenv';
import userSchema from './src/graphql/userIndex.js';
import adminSchema from './src/graphql/adminIndex.js';
import { getUserId, getAdminId } from './src/utils.js';

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
app.use(express.urlencoded({
    extended: true
}));

app.use(cookieParser());
const corsCredentials = {
    credentials: true,
    // origin: process.env.CLIENT_URL,
    origin: true,
}
app.use(cors(corsCredentials));
app.options('*', cors(corsCredentials));

app.set('port', (process.env.PORT || 5000))

function contextUser(req) {
    // console.log("request in context: "+ req.cookies.token);
    return req && req.cookies.token
          ? getUserId(req)
          : null;
}

function contextAdmin(req) {
    // console.log("request in context: "+ req.cookies.token);
    return req && req.cookies.token
          ? getAdminId(req)
          : null;
}

// user's endpoint
app.use('/user', graphqlHTTP((request, response) => ({
    //directing express-graphql to use this schema to map out the graph 
    schema: userSchema,
    context: {
        ...request,response,
        userId: contextUser(request),
    },
    graphiql:true
})));

// administrator's endpoint
app.use('/admin', graphqlHTTP((request, response) => ({
    schema: adminSchema,
    context: {
        ...request,response,
        adminId: contextAdmin(request),
    },
    graphiql:true
})));

// for testing
app.use('/', function (req, res) {
    res.send("hello");
})

app.listen(app.get('port'), () => {
    console.log("App is running at localhost:" + app.get('port'));
}); 
