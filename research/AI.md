#AI Strategy

Alchemy node SDK (doesn't include emotion analysis, may not be able to use)

- sentiment analysis
  - score (-1 <=> 1)
- Taxonomy Parsing
  - blue headings from the doc
  - (0 <=> 1)
- emotion analysis
  - anger, disgust, fear, joy, sadness (0 <=> 1)


each response has a column for each of these attributes. these attributes are set asynchronously.
each time the AI is to guess, it grabs the last 10 responses for each player in the game, trains the AI, 
and then picks a random response that is left and runs it against the neural network.
if the randomly chosen response does not have its data yet, try and fetch it. if that fails, pick randomly.

Considerations: 

add a rule for including AI?
add AI as a player automatically
probably best to make AI guesser go last?
never assign AI as the reader
create an AI column for users (indexed). always use findOrCreate to grab the AI player.


- DB migration for AI flag (indexed column)

- Rule for AI player
 - if yes, automatically invite and accept the AI

- after every response is saved, call alchemy API and grab data we care about
- process and save alchemy response

- set reader
 - skip AI every time

- when AI is guesser, grab data for all players in game, train network, make guess