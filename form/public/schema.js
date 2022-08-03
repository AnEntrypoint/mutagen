window.schema = [
  {
    type: "input",
    title: "Submission name",
    name: "project",
    prefix: "https://"+window.location.host + "/view.html?name=",
    placeholder: "example-name",
    value: window.LOADNAME,
  },
  {
    type: "input",
    title: "Public link",
    name: "link",
    prefix: "https://",
    placeholder: "www.github.com/username/projectname",
  },
  {
    type: "input",
    name: "title",
    title: "Title",
  },
  {
    type: "input",
    name: "author",
    title: "Author",
  },
  {
    type: "textarea",
    name: "excerpt",
    title: "Excerpt",
  },
  {
    type: "markdown",
    name: "description",
    title: "Description",
  },
  {
    type: "file",
    name: "image",
    title: "Title image",
  },
];
