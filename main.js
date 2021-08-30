const express    = require("express")
const bodyParser = require("body-parser")
const Events     = require("./src/events")
const util       = require("util")
const app        = express();

app.use(bodyParser.json());

// webhook POST -> construct message -> send message
app.post("/", handleRequest);
app.post("/:webhookId/:webhookToken", handleRequest);

function handleRequest(req, res) {

  console.log(req.params.webhookId)
  console.log(req.params.webhookToken)

  // @TODO Verify that this request came from GitHub
  const event = req.get("X-GitHub-Event");
  if (event) {
    if (typeof Events[event] !== "function") {
      console.error(`Event type '${event}' is not handled.`);
      console.dir({ req, res, event });
    }
    const message = Events[event](req.body);

    try {
      sendMessage(
        req.params.webhookId,
        req.params.webhookToken,
        message
      );
      res.sendStatus(200);
    } catch (e) {
      console.error("ERROR SENDING MESSAGES:", e);
    }
  } else {
    res.sendStatus(400);
  }
}

app.get("/", (req, res) => {
  res.send(
    "This address is not meant to be accessed by a web browser. Please read the readme on GitHub at https://github.com/falconerd/discord-bot-github"
  );
});

app.listen(process.env.PORT || 8080, async () => {
  console.log("Started on port", process.env.PORT || 8080);
});

function sendMessage(webhookId, webhookToken, message) {
  console.log("hello")
  require("node-fetch")(util.format(
    "https://discord.com/api/webhooks/%s/%s",
    webhookId,
    webhookToken
  ), {
    "method": "POST",
    "headers": { "Content-Type": "application/json" },
    "body": JSON.stringify({
      "content": message
    })

  })
    // .then(res => console.log(res))
    .catch(err => console.error(err));
}
