const express = require("express");
const router = express.Router();

const Posts = require("./posts-model");

// 1. GET Returns **an array of all the post objects** contained in the database
router.get("/", (req, res) => {
  Posts.find(req)
    .then((posts) => {
      res.status(200).json(posts);
    })
    .catch((error) => {
      console.log(error);
      res
        .status(500)
        .json({ message: "The posts information could not be retrieved" });
    });
});

// 2. GET Returns **the post object with the specified id**
router.get("/:id", (req, res) => {
  Posts.findById(req.params.id)
    .then((post) => {
      if (post) {
        res.status(200).json(post);
      } else {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist" });
      }
    })
    .catch((error) => {
      console.log(error);
      res
        .status(500)
        .json({ message: "The post information could not be retrieved" });
    });
});

// 3. POST Creates a post using the information sent inside
//  the request body and returns **the newly created post object**
router.post("/", (req, res) => {
  const { title, contents } = req.body;
  if (!title || !contents) {
    res
      .status(400)
      .json({ message: "Please provide title and contents for the post" });
  } else {
    Posts.insert({ title, contents })
      .then(({ id }) => {
        return Posts.findById(id);
      })
      .then((post) => {
        res.status(201).json(post);
      })
      .catch((error) => {
        res.status(500).json({
          error: error.message,
          message: "There was an error while saving the post to the database",
        });
      });
  }
});

// 4. PUT Updates the post with the specified id using data from
// the request body and **returns the modified document**, not the original
router.put("/:id", (req, res) => {
  const { title, contents } = req.body;
  Posts.findById(req.params.id)
    .then((post) => {
      if (!post) {
        res
          .status(404)
          .json({ message: "The post with the specified ID does not exist" });
      } else if (!title || !contents) {
        res
          .status(400)
          .json({ message: "Please provide title and contents for the post" });
      } else {
        Posts.update(req.params.id, req.body)
          .then(() => {
            return Posts.findById(req.params.id);
          })
          .then((newPost) => {
            res.status(200).json(newPost);
          });
      }
    })
    .catch((error) => {
      console.log(error);
      res
        .status(500)
        .json({ message: "The post information could not be retrieved" });
    });
});

// 5. Removes the post with the specified id and returns the **deleted post object**
router.delete("/:id", async (req, res) => {
  const currentPost = await Posts.findById(req.params.id);
  try {
    if (!currentPost) {
      res
        .status(404)
        .json({ message: "The post with the specified ID does not exist" });
    } else {
      await Posts.remove(req.params.id);
      res.json(currentPost);
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "The post information could not be retrieved",
    });
  }
});

// 6. Returns an **array of all the comment objects**
// associated with the post with the specified id
router.get("/:id/comments", async (req, res) => {
  const post = await Posts.findById(req.params.id);
  try {
    if (!post) {
      res
        .status(404)
        .json({ message: "The post with the specified ID does not exist" });
    } else {
      const comments = await Posts.findPostComments(req.params.id);
      res.status(200).json(comments);
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "The post information could not be retrieved",
    });
  }
});

module.exports = router;
