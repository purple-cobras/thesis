# Overview

Black Mamba is a hilarious multiplayer guessing game. In each round of the game, one player is assigned as **the reader**, who will put forth the round's **topic**. One example of a topic is "What Would Donald Trump do on his first day in office?", but the topic can truly be anything. All players, including the reader, then submit a response to the topic. Again, the response can truly be anything, but in general the goal is to come up with a funny and/or relevant response, given the topic.

Once all responses have been collected, a player is assigned to be the first **guesser** of the round. As the guesser, you need to match up responses with players. You can choose any player/response combination, except for your own. The guesser guesses until a) they have guessed all of the responses correctly or b) they make an incorrect guess. Upon an incorrect guess, the next guesser is assigned. This continues until all responses have been guessed, or until the guesser has guessed all but their own response. 

**For each correct guess a player makes, they receive a point**. If the guesser makes a guess and is the last player standing in a round, they receive a bonus point. 

## Configurable Rules
These rules may be toggled/determined at game creation time

- The number of points to play up to (10 to 50)
- Whether or not being guessed in a round makes you ineligible for guessing when it should be your turn to do so
- Whether or not to have the game read responses aloud once all responses for the round have been submitted
- Wheter or not to include an AI opponent (more on this below)

## MambaBot
The AI player (MambaBot), if included, will never be assigned as the reader. Therefore they never come up with topics. MambaBot only makes guesses. MambaBot analyzes players past responses and compares them to all responses in a round. Using quantitative data extracted from this analysis, it makes an educated guess as to who wrote which response.