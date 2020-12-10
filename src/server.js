import express, { request } from 'express';
import { graphqlHTTP } from 'express-graphql';
import schema from './graphql/index.js';
import mongoose from 'mongoose';
import { getUserId } from './utils.js';

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

function context(req) {
    // console.log("req: "+ req);
    return req && req.headers.authorization
          ? getUserId(req)
          : null;
    // const userId = getUserId(req);
    // console.log("userId: " + userId);
    // return userId;
}


//This route will be used as an endpoint to interact with Graphql, 
//All queries will go through this route. 
app.use('/graphql', graphqlHTTP((req) => ({
    //directing express-graphql to use this schema to map out the graph 
    schema,
    context: {
        request: request,
        userId: context(req),
    },
    //directing express-graphql to use graphiql when goto '/graphql' address in the browser
    //which provides an interface to make GraphQl queries
    graphiql:true
})));

app.listen(3000, () => {
    console.log('Listening on port 3000');
}); 
