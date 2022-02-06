const Toys = require('../constants/Toys.js')

module.exports = {
    formatToyName: function(link) {
        let toyInfo = "";
        link.toys.forEach(toy => {
            let iToy = Toys[toy.name]
            if (toyInfo !== "") {
                toyInfo = toyInfo + ", "
            }
            toyInfo = toyInfo + iToy.name + " - " + iToy.emoji
        })
        return toyInfo
    }
}