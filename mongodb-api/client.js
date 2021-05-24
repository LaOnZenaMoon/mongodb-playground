const axios = require("axios");

console.log('client code running');

const URI = 'http://localhost:3000';

const test = async () => {
  console.time('loading time: ');

  let {data: {blogs}} = await axios.get(`${URI}/blog`);

  blogs = await Promise.all(blogs.map(async blog => {
    const [res1, res2] = await Promise.all([
      axios.get(`${URI}/user/${blog.user}`),
      axios.get(`${URI}/blog/${blog.id}/comments`),
    ]);

    blog.user = res1.data.user;
    blog.comments = await Promise.all(res2.data.comments.map(async comment => {
      const {data: {user}} = await axios.get(`${URI}/user/${comment.user}`);
      comment.user = user;
      return comment;
    }));

    return blog;
  }));

  console.timeEnd('loading time: ');
  // console.dir(blogs[0], {depth: 10});

  return blogs;
}

const testGroup = async () => {
  await test();
  await test();
  await test();
  await test();
  await test();
  await test();
}

testGroup();
