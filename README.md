# subscription-manager-server

## Dec 17 - submission
### Endpoints
User: http://subscription-manager-server.tech/user

Administrator: http://subscription-manager-server.tech/admin
## Dec 9 - check in 2
### Installation
1. Clone the repo
2. ```npm install```
3. ```npm run start:dev```
4. To run GraphQL queries, install GraphQL Playground IDE: https://github.com/graphql/graphql-playground

### Examples to run on GraphQL Playground IDE
URL: http://localhost:3000/graphql
* sign up
```
mutation {
    signup(
        email: "james@apple.com"
        username: "apple"
        password: "apple1288"
    ) {
        token
        user {
        id
        }
    }
}
```
* login
```
mutation {
  login(
    email: "kelly@apple.com"
    password: "apple1288"
  ) {
    token,
    user {
      username
      id
    }
  }
}
```

* create a subscription for current logged-in user: add `{"Authorization": "Bearer TOKEN"}` in the HTTP HEADERS, replace TOKEN with this user's token
```
mutation {
    postSubscriptionToUser(
    name: "hulu", 
    billingDate: "2020-12-20",
    cost: 5.99,
    frequency: MONTHLY, 
    category: CONTENT
  ) {
    username
    subscriptions {
      name
      billingDate
      cost
      frequency
      category
      userId
    }
    subscriptionsId
  }
}
```
result
```
{
  "data": {
    "postSubscriptionToUser": {
      "username": "apple",
      "subscriptions": [
        {
          "name": "hulu",
          "billingDate": "2020-12-20",
          "cost": 5.99,
          "frequency": "MONTHLY",
          "category": "CONTENT",
          "userId": "5fd16970808f1416445b47a6"
        }
      ],
      "subscriptionsId": [
        "5fd16baf808f1416445b47a7"
      ]
    }
  }
}
```


