const path = require("path")

module.exports = require("data-store")({
  path: path.join(__dirname, "..", "config.json")
})