# Bash coop game
⚠️ Use at your own risk! I don't take any responsibility for damage caused by the use of this application. ⚠️

This is a game, which let's players cooperate in a shared Bash session. The players will take turns and can use exactly 4 actions at the time. These are the available actions to the players:
- Entering one character to stdin
- Executing the current line in the terminal (Enter key)
- Clearing the current line in the terminal (Escape key)
Every player will see stdin and stdout even if they are not the active player. 

Have fun, but be careful as the host, because other players might execute dangerous commands on your computer. 
I highly recommend running this game within a container, to mitigate potential risks for the host.

![Screenshot of the game](https://github.com/nknickrehm/bash-coop-game/blob/master/image.jpg?raw=true)
## Build and run
- Build the container `docker build -t bash-coop-game .`
- Start the container `docker run -p 3000:3000 bash-coop-game`

## Play the game
- Open http://localhost:3000 in your browser
- You can play the game through multiple browser windows
- You could expose port 3000 in your local network to play with your colleagues
    - You would need to change the server address in `static/index.html` to do that