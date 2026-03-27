import MarkdownIt from "markdown-it";
// @ts-ignore
import markdownItBiblatex from "@arothuis/markdown-it-biblatex";

const md = new MarkdownIt();

// Configure the biblatex plugin
md.use(markdownItBiblatex, {
  bibPath: "./src/citation.biblatex",
});

// Read the markdown file
const markdownContent = await Bun.file("./src/main.md").text();

// Parse markdown to HTML
const htmlContent = md.render(markdownContent);

// Create the full HTML page
const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Formal Verification</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    h1 {
      border-bottom: 2px solid #eee;
      padding-bottom: 0.5rem;
    }
    .citation {
      background: #f5f5f5;
      padding: 1rem;
      margin: 1rem 0;
      border-left: 3px solid #007bff;
    }
    .bibliography {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 2px solid #eee;
    }
    .bibliography h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>
`;

// Start the server
const server = Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response(fullHtml, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
