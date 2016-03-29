var helpers = require('../db/helpers');
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
	this.trainer.train(trainingSet);
	console.log('returning trained network')
	return this.network;
};

// Returns object with trained neural networks for each user.
var Networks = function (players, attributes) {

	players.forEach(function (player) {
		if (!player.ai) {
			var trainingSet = [];
			for (var key in attributes) {
				var output = (~~key === player.id) ? [1] : [0];

				attributes[key].forEach(function (attribute) {
					var dataPoint = {};

					dataPoint.input = attribute;
					dataPoint.output = output;
					trainingSet.push(dataPoint);
				});
			}
			// console.log('trainingSet:', trainingSet)
			console.log('starting to create NN for:', player.id)
			this[player.id] = new PlayerNn(player.id);
			this[player.id].train(trainingSet);
			// console.log('inside Networks constructor forEach:', this[player.id].player, ' was created')
			// console.log('this:', this)
		}
	}.bind(this));
	
	// console.log('inside Networks constructor:', this);
	// console.log('Networks:',Object.keys(this))
};

module.exports = Networks;
