# Blog App

A full-stack blog application featuring user authentication, creating, editing, and deleting posts, and comment functionality. 

## Features

- Seperate admin/user section 
- Light/dark/system mode option
- Compatible for desktop as well as mobile screen
- Easy to use interface


## Screenshots

![blog app](https://github.com/user-attachments/assets/c3863f41-8004-4b39-970e-49012e08e994)


## Tech Stack

**Client:** React, Redux, Tailwind CSS

**Server:** Node, Express.js

**Database:** MongoDb

**ODM:** Mongoose

**Image store:** Firebase

## Demo

For demo, please use this [Link](https://ritesh-blogapp.onrender.com/).

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

In "root" directory

`MONGO_DB`

`JWT_SECRET`

In "./client" directory

`VITE_FIREBASE_API_KEY`


## Run Locally

Clone the project

```bash
  git clone https://github.com/rajriteshgupta/BlogApp.git
```

Go to the project directory

```bash
  cd blog-app
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```
