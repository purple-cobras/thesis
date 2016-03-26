var helpers = require('../db/helpers');
var synaptic = require('synaptic');
var Neuron = synaptic.Neuron,
		Layer = synaptic.Layer,
		Network = synaptic.Network,
		Trainer = synaptic.Trainer,
		Architect = synaptic.Architect;

var UserNn = function (user) {

	// Define neural network architecture as LSTM using
	// 2 input layers, 6 memory block assemblies and 1 output layer
	// https://github.com/cazala/synaptic/wiki/Architect
	this.network = new Architect.LSTM(2,6,1);

	// Pass network to trainer
	this.trainer = new Trainer(this.network);
};

UserNn.prototype.train = function (trainingSet) {
	this.trainer.train(trainingSet);
	return this.network.standalone();
};

// Returns object with trained neural networks for each user.
var Networks = function (users, trainingData) {

	users.forEach(function (userId) {
		var trainingSet = [];
		trainingData.forEach(function (dataDb) {
			// dataTrain = {}
			// dataTrain.input = [alchemy attributes]
			// if data.user_id === userId
			  // dataTrain.output = [1]
			// else 
			  // dataTrain.output = [0]
		});
		this[user] = new UserNn();
		this[user].train(trainingSet);
	});
}
