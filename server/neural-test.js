

var synaptic = require('synaptic');
var Neuron = synaptic.Neuron,
		Layer = synaptic.Layer,
		Network = synaptic.Network,
		Trainer = synaptic.Trainer,
		Architect = synaptic.Architect;


// -[ RECORD 7 ]----
// user_id   | 1
// sentiment | -0.92
// anger     | 0.69
// disgust   | 0.15
// fear      | 0.10
// joy       | 0.02
// sadness   | 0.08
// -[ RECORD 8 ]----
// user_id   | 1
// sentiment | -0.82
// anger     | 0.99
// disgust   | 0.13
// fear      | 0.01
// joy       | 0.00
// sadness   | 0.06
// -[ RECORD 9 ]----
// user_id   | 1
// sentiment | -0.84
// anger     | 0.18
// disgust   | 0.03
// fear      | 0.02
// joy       | 0.26
// sadness   | 0.42
// -[ RECORD 10 ]---
// user_id   | 2
// sentiment | 0.85
// anger     | 0.04
// disgust   | 0.03
// fear      | 0.02
// joy       | 0.86
// sadness   | 0.18
// -[ RECORD 11 ]---
// user_id   | 2
// sentiment | 0.00
// anger     | 0.11
// disgust   | 0.18
// fear      | 0.19
// joy       | 0.45
// sadness   | 0.21
// -[ RECORD 12 ]---
// user_id   | 2
// sentiment | 0.72
// anger     | 0.09
// disgust   | 0.10
// fear      | 0.27
// joy       | 0.27
// sadness   | 0.18
// -[ RECORD 13 ]---
// user_id   | 1
// sentiment | -0.57
// anger     | 0.12
// disgust   | 0.48
// fear      | 0.11
// joy       | 0.17
// sadness   | 0.09
// -[ RECORD 14 ]---
// user_id   | 2
// sentiment | 0.00
// anger     | 0.07
// disgust   | 0.07
// fear      | 0.04
// joy       | 0.59
// sadness   | 0.10

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

// translate sentiment 0->1 with: Math.round((sentiment + 1) / 2)
var trainingSet = [
	{
		input: [0.03,0.15,0.33,0.12,0.04,0.26],
		output: [0]
	},
	{
		input: [0.11,0.21,0.69,0.04,0.04,0.06],
		output: [0]
	},
	{
		input: [0.39,0.17,0.10,0.08,0.22,0.17],
		output: [0]
	},
	{
		input: [0.81,0.14,0.03,0.04,0.60,0.06],
		output: [1]
	},
	{
		input: [0.86,0.77,0.18,0.03,0.06,0.08],
		output: [1]
	},
	{
		input: [0.93,0.13,0.26,0.09,0.15,0.23],
		output: [1]
	}
]; // approx 100
var biggerSet = [];
var duplicate = function () {
	// trainingSet.forEach(function (attr) {
	// 	biggerSet.push(attr);
	// });
	for (var attr of trainingSet) {
		biggerSet.push(attr);
	}
};

for (var i = 0; i < 10000; i++) { 
	duplicate(); 
}

console.log('data points:', biggerSet.length)

var response = [0.22,0.12,0.48,0.11,0.17,0.09]; // Not Tom
var tomNn = new UserNn();
console.log('tomNn',tomNn)
for (var j = 0; j < 12; j++) { 
	tomNn.train(biggerSet);
}
console.log('users:', j);
var prob = tomNn.network.activate(response);
console.log(prob[0].toFixed(10));
