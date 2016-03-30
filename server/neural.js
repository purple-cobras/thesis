var synaptic = require('synaptic');
var Neuron = synaptic.Neuron,
		Layer = synaptic.Layer,
		Network = synaptic.Network,
		Trainer = synaptic.Trainer,
		Architect = synaptic.Architect;

var PlayerNn = function (player) {

	this.player = player;

	// Define neural network architecture as LSTM using
	// 2 input layers, 6 memory block assemblies and 1 output layer
	// https://github.com/cazala/synaptic/wiki/Architect
	this.network = new Architect.LSTM(2,6,1);

	// Pass network to trainer
	this.trainer = new Trainer(this.network);
};

PlayerNn.prototype.train = function (trainingSet) {
	this.trainer.train(trainingSet, {iterations: 50000});
	console.log('Returning trained NN for player #', this.player);
	return this.network;
};

// Returns object with a trained neural network for each user.
var Networks = function (players, attributes) {

	players.forEach(function (player) {
		if (!player.ai) {
			var trainingSet = [];
			for (var key in attributes) {
				var output = (Number(key) === player.id) ? [1] : [0];

				attributes[key].forEach(function (attribute) {
					var dataPoint = {};

					dataPoint.input = attribute;
					dataPoint.output = output;
					trainingSet.push(dataPoint);
				});
			}

			this[player.id] = new PlayerNn(player.id);
			this[player.id].train(trainingSet);
		}
	}.bind(this));
};

module.exports = Networks;
